variable "domain_name" {
  description = "Primary domain for the certificate."
  type        = string
}

variable "subject_alternative_names" {
  description = "Additional domains (e.g. www.<domain>)."
  type        = list(string)
  default     = []
}

variable "zone_id" {
  description = "Route53 hosted zone id for DNS validation records."
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
