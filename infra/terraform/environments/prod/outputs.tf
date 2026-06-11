# Feed these into GitHub repo variables for the CI/CD workflows.

output "frontend_bucket" {
  description = "S3 bucket the frontend-deploy workflow syncs to."
  value       = module.s3_frontend.bucket_id
}

output "cloudfront_distribution_id" {
  description = "For CloudFront cache invalidation."
  value       = module.cloudfront.distribution_id
}

output "lambda_function_name" {
  description = "For backend-deploy `lambda update-function-code`."
  value       = module.lambda.function_name
}

output "api_base_url" {
  description = "Set as NEXT_PUBLIC_API_BASE_URL for the frontend build."
  value       = "https://${local.api_domain}"
}

output "site_url" {
  value = "https://${var.domain_name}"
}

output "deploy_role_arn" {
  description = "OIDC role for frontend + backend deploy workflows."
  value       = module.github_oidc.deploy_role_arn
}

output "terraform_role_arn" {
  description = "OIDC role for the terraform workflow."
  value       = module.github_oidc.terraform_role_arn
}
