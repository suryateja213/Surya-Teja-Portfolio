variable "name" {
  type = string
}

variable "origin_domain_name" {
  description = <<-EOT
    S3 bucket regional domain name (the origin). Pass the deterministic
    "<bucket>.s3.<region>.amazonaws.com" form (not the bucket module's output)
    so CloudFront does not depend on the bucket module — that would create a
    cycle, since the bucket policy depends on this distribution's ARN.
  EOT
  type        = string
}

variable "aliases" {
  description = "CNAMEs served by this distribution (apex + www)."
  type        = list(string)
}

variable "certificate_arn" {
  description = "ACM cert ARN — MUST be in us-east-1 for CloudFront."
  type        = string
}

variable "price_class" {
  description = "PriceClass_100 (NA+EU) is the cheapest; widen if needed."
  type        = string
  default     = "PriceClass_100"
}

variable "tags" {
  type    = map(string)
  default = {}
}
