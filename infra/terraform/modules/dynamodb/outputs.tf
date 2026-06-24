output "table_name" {
  value = aws_dynamodb_table.this.name
}

output "table_arn" {
  value = aws_dynamodb_table.this.arn
}

output "gsi_arn" {
  description = "ARN pattern covering the table's indexes (for IAM scoping)."
  value       = "${aws_dynamodb_table.this.arn}/index/*"
}

output "stream_arn" {
  description = "DynamoDB stream ARN (source for the worker Lambda)."
  value       = aws_dynamodb_table.this.stream_arn
}
