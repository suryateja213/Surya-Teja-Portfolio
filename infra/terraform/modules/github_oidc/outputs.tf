output "deploy_role_arn" {
  description = "Role for frontend + backend deploy workflows."
  value       = aws_iam_role.deploy.arn
}

output "terraform_role_arn" {
  description = "Role for the terraform workflow."
  value       = aws_iam_role.terraform.arn
}

output "oidc_provider_arn" {
  value = local.oidc_provider_arn
}
