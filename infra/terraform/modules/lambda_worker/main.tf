# DynamoDB Streams worker Lambda — the serverless-native event pipeline
# consumer. Terraform owns the function shell; CI ships the real code (the SAME
# artifact as the API function, just a different handler). The event-source
# mapping subscribes it to the table stream, filtered to EVENT items only.

data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = <<-PY
      def handler(event, context):
          return {"processed": 0}
    PY
    filename = "app/worker/handler.py"
  }
}

# ---- IAM ----

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "this" {
  name               = "${var.function_name}-role"
  assume_role_policy = data.aws_iam_policy_document.assume.json
  tags               = var.tags
}

data "aws_iam_policy_document" "permissions" {
  # Read the table stream (the event source).
  statement {
    sid    = "StreamRead"
    effect = "Allow"
    actions = [
      "dynamodb:GetRecords",
      "dynamodb:GetShardIterator",
      "dynamodb:DescribeStream",
      "dynamodb:ListStreams",
    ]
    resources = [var.stream_arn]
  }

  # Write the derived METRIC counters back to the table.
  statement {
    sid    = "MetricWrite"
    effect = "Allow"
    actions = [
      "dynamodb:UpdateItem",
      "dynamodb:PutItem",
      "dynamodb:GetItem",
    ]
    resources = [var.table_arn]
  }

  statement {
    sid       = "Logs"
    effect    = "Allow"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.this.arn}:*"]
  }
}

resource "aws_iam_role_policy" "this" {
  name   = "${var.function_name}-policy"
  role   = aws_iam_role.this.id
  policy = data.aws_iam_policy_document.permissions.json
}

# ---- Log group ----

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

# ---- Function ----

resource "aws_lambda_function" "this" {
  function_name = var.function_name
  role          = aws_iam_role.this.arn
  runtime       = "python3.12"
  handler       = "app.worker.handler.handler"
  architectures = ["x86_64"]
  memory_size   = var.memory_size
  timeout       = var.timeout

  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  environment {
    variables = var.environment
  }

  depends_on = [
    aws_iam_role_policy.this,
    aws_cloudwatch_log_group.this,
  ]

  tags = var.tags

  # CI deploys the real artifact; don't let Terraform revert it.
  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }
}

# ---- Stream subscription ----

resource "aws_lambda_event_source_mapping" "this" {
  event_source_arn  = var.stream_arn
  function_name     = aws_lambda_function.this.arn
  starting_position = "LATEST"
  batch_size        = var.batch_size

  # Only EVENT inserts wake the worker — PROJECT/CONTACT/METRIC writes are
  # filtered out at the source, so they cost no invocations.
  filter_criteria {
    filter {
      pattern = jsonencode({
        eventName = ["INSERT"]
        dynamodb = {
          NewImage = {
            entity = { S = ["EVENT"] }
          }
        }
      })
    }
  }

  # Metrics are best-effort (the worker swallows per-record errors), so a small
  # retry budget and a record-age cap keep a bad batch from blocking the shard.
  maximum_retry_attempts        = var.maximum_retry_attempts
  maximum_record_age_in_seconds = 3600
}
