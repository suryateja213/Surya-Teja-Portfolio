variable "function_name" {
  type = string
}

variable "table_arn" {
  description = "DynamoDB table ARN the function may access."
  type        = string
}

variable "table_gsi_arn" {
  description = "DynamoDB index ARN pattern (table_arn/index/*)."
  type        = string
}

variable "environment" {
  description = "Environment variables for the function (incl. secrets)."
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "memory_size" {
  type    = number
  default = 512
}

variable "timeout" {
  type    = number
  default = 15
}

variable "log_retention_days" {
  type    = number
  default = 14
}

variable "tags" {
  type    = map(string)
  default = {}
}
