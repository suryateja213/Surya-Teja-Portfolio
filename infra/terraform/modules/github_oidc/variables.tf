variable "name_prefix" {
  description = "Prefix for the IAM role names."
  type        = string
  default     = "surya-portfolio-gha"
}

variable "github_repo" {
  description = "owner/repo, e.g. suryateja213/Surya-Teja-Portfolio."
  type        = string
}

variable "create_oidc_provider" {
  description = "Create the GitHub OIDC provider. Set false if it already exists in the account."
  type        = bool
  default     = true
}

variable "existing_oidc_provider_arn" {
  description = "ARN of an existing GitHub OIDC provider (when create_oidc_provider = false)."
  type        = string
  default     = ""
}

# ARNs the deploy role is scoped to.
variable "frontend_bucket_arn" {
  type = string
}

variable "cloudfront_distribution_arn" {
  type = string
}

variable "lambda_function_arn" {
  type = string
}

variable "worker_function_arn" {
  description = "Worker Lambda ARN — CI updates its code alongside the API function."
  type        = string
}

# State resources the terraform role needs.
variable "state_bucket_arn" {
  type = string
}

variable "lock_table_arn" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
