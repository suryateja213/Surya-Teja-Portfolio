variable "function_name" {
  type = string
}

variable "table_arn" {
  description = "DynamoDB table ARN the worker writes METRIC items to."
  type        = string
}

variable "stream_arn" {
  description = "DynamoDB stream ARN the worker consumes."
  type        = string
}

variable "environment" {
  description = "Environment variables for the function."
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "memory_size" {
  type    = number
  default = 256
}

variable "timeout" {
  type    = number
  default = 30
}

variable "batch_size" {
  description = "Max stream records per worker invocation."
  type        = number
  default     = 25
}

variable "maximum_retry_attempts" {
  type    = number
  default = 3
}

variable "log_retention_days" {
  type    = number
  default = 14
}

variable "tags" {
  type    = map(string)
  default = {}
}
