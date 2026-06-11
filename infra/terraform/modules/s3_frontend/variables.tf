variable "bucket_name" {
  type = string
}

variable "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution allowed to read the bucket (OAC)."
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
