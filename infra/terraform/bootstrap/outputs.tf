output "state_bucket_name" {
  description = "Use this as the `bucket` in environments/prod/backend.tf."
  value       = aws_s3_bucket.state.id
}

output "lock_table_name" {
  description = "Use this as the `dynamodb_table` in environments/prod/backend.tf."
  value       = aws_dynamodb_table.locks.name
}
