locals {
  api_domain = "api.${var.domain_name}"
  # Deterministic S3 regional domain — used by CloudFront so it doesn't depend on
  # the s3_frontend module (whose bucket policy depends on the distribution ARN,
  # which would otherwise form a cycle).
  frontend_origin_domain = "${var.frontend_bucket_name}.s3.${var.region}.amazonaws.com"
}

# Hosted zone already exists (do not create it).
data "aws_route53_zone" "this" {
  name         = var.domain_name
  private_zone = false
}

# ---- Certificates ----
# CloudFront cert MUST be in us-east-1.
module "acm_cloudfront" {
  source = "../../modules/acm"
  providers = {
    aws = aws.us_east_1
  }
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  zone_id                   = data.aws_route53_zone.this.zone_id
}

# Regional cert for the API custom domain.
module "acm_api" {
  source      = "../../modules/acm"
  domain_name = local.api_domain
  zone_id     = data.aws_route53_zone.this.zone_id
}

# ---- Backend: DynamoDB -> Lambda -> API Gateway ----
module "dynamodb" {
  source     = "../../modules/dynamodb"
  table_name = var.table_name
}

module "lambda" {
  source        = "../../modules/lambda_fastapi"
  function_name = "${var.table_name}-api"
  table_arn     = module.dynamodb.table_arn
  table_gsi_arn = module.dynamodb.gsi_arn

  environment = {
    TABLE_NAME          = module.dynamodb.table_name
    AWS_REGION          = var.region
    JWT_SECRET          = var.jwt_secret
    ADMIN_EMAIL         = var.admin_email
    ADMIN_PASSWORD_HASH = var.admin_password_hash
    ALLOWED_ORIGINS     = "https://${var.domain_name},https://www.${var.domain_name}"
  }
}

module "api_gateway" {
  source               = "../../modules/api_gateway"
  name                 = "${var.table_name}-http-api"
  lambda_invoke_arn    = module.lambda.invoke_arn
  lambda_function_name = module.lambda.function_name
  api_domain_name      = local.api_domain
  certificate_arn      = module.acm_api.certificate_arn
}

# ---- Frontend: S3 (private) <-> CloudFront ----
module "cloudfront" {
  source             = "../../modules/cloudfront"
  name               = var.frontend_bucket_name
  origin_domain_name = local.frontend_origin_domain
  aliases            = [var.domain_name, "www.${var.domain_name}"]
  certificate_arn    = module.acm_cloudfront.certificate_arn
}

module "s3_frontend" {
  source                      = "../../modules/s3_frontend"
  bucket_name                 = var.frontend_bucket_name
  cloudfront_distribution_arn = module.cloudfront.distribution_arn
}

# ---- DNS ----
module "route53" {
  source                    = "../../modules/route53"
  zone_id                   = data.aws_route53_zone.this.zone_id
  domain_name               = var.domain_name
  cloudfront_domain_name    = module.cloudfront.domain_name
  cloudfront_hosted_zone_id = module.cloudfront.hosted_zone_id
  api_domain_name           = local.api_domain
  api_domain_target         = module.api_gateway.domain_target
  api_hosted_zone_id        = module.api_gateway.domain_hosted_zone_id
}

# ---- CI/CD identity ----
module "github_oidc" {
  source                      = "../../modules/github_oidc"
  github_repo                 = var.github_repo
  create_oidc_provider        = var.create_github_oidc_provider
  existing_oidc_provider_arn  = var.existing_oidc_provider_arn
  frontend_bucket_arn         = module.s3_frontend.bucket_arn
  cloudfront_distribution_arn = module.cloudfront.distribution_arn
  lambda_function_arn         = module.lambda.function_arn
  state_bucket_arn            = var.state_bucket_arn
  lock_table_arn              = var.lock_table_arn
}
