variable "name" {
  type = string
}

variable "lambda_invoke_arn" {
  type = string
}

variable "lambda_function_name" {
  type = string
}

variable "api_domain_name" {
  description = "Custom domain, e.g. api.kommugurisuryateja.com."
  type        = string
}

variable "certificate_arn" {
  description = "Regional ACM cert ARN for the custom domain."
  type        = string
}

variable "log_retention_days" {
  type    = number
  default = 14
}

variable "tags" {
  type    = map(string)
  default = {}
}
