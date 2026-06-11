output "distribution_id" {
  description = "For CI cache invalidation."
  value       = aws_cloudfront_distribution.this.id
}

output "distribution_arn" {
  description = "For the S3 OAC bucket policy condition."
  value       = aws_cloudfront_distribution.this.arn
}

output "domain_name" {
  description = "CloudFront domain (alias target for Route53)."
  value       = aws_cloudfront_distribution.this.domain_name
}

output "hosted_zone_id" {
  description = "CloudFront's fixed hosted zone id (for alias records)."
  value       = aws_cloudfront_distribution.this.hosted_zone_id
}
