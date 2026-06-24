variable "region" {
  description = "Primary AWS region for app resources."
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Apex domain (hosted zone must already exist in this account)."
  type        = string
}

variable "github_repo" {
  description = "owner/repo for the OIDC trust policy."
  type        = string
}

variable "admin_email" {
  description = "Single-admin login email for the backend."
  type        = string
}

# ---- Secrets — pass via TF_VAR_* env vars or GH Environment secrets, never tfvars ----

variable "jwt_secret" {
  description = "JWT signing secret for the backend."
  type        = string
  sensitive   = true
}

variable "admin_password_hash" {
  description = "bcrypt hash of the admin password."
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key for Ask Surya AI. Empty disables /ask gracefully."
  type        = string
  sensitive   = true
  default     = ""
}

# ---- Optional knobs ----

variable "table_name" {
  type    = string
  default = "surya-portfolio"
}

variable "frontend_bucket_name" {
  description = "Globally-unique bucket name for the static site."
  type        = string
  default     = "surya-portfolio-frontend"
}

variable "create_github_oidc_provider" {
  description = "Create the GitHub OIDC provider (false if it already exists in the account)."
  type        = bool
  default     = true
}

variable "existing_oidc_provider_arn" {
  type    = string
  default = ""
}

# State resources from bootstrap — needed to scope the terraform OIDC role.
variable "state_bucket_arn" {
  type    = string
  default = "arn:aws:s3:::surya-portfolio-tfstate"
}

variable "lock_table_arn" {
  type    = string
  default = "arn:aws:dynamodb:us-east-1:*:table/surya-portfolio-tflocks"
}

variable "tags" {
  type = map(string)
  default = {
    Project   = "surya-portfolio"
    ManagedBy = "terraform"
  }
}
