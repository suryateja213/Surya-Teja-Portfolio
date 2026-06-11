variable "table_name" {
  description = "Name of the single DynamoDB table."
  type        = string
}

variable "point_in_time_recovery" {
  description = "Enable PITR (continuous backups)."
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags applied to the table."
  type        = map(string)
  default     = {}
}
