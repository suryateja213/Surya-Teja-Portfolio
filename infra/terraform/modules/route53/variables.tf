variable "zone_id" {
  type = string
}

variable "domain_name" {
  description = "Apex domain."
  type        = string
}

variable "cloudfront_domain_name" {
  type = string
}

variable "cloudfront_hosted_zone_id" {
  type = string
}

variable "api_domain_name" {
  description = "Full API hostname, e.g. api.kommugurisuryateja.com."
  type        = string
}

variable "api_domain_target" {
  description = "API Gateway regional domain target."
  type        = string
}

variable "api_hosted_zone_id" {
  description = "API Gateway regional domain hosted zone id."
  type        = string
}
