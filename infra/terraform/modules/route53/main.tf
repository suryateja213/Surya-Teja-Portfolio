# DNS alias records. The apex and www both point at CloudFront (www gets
# redirected to apex by the CloudFront Function). api points at API Gateway.

# Apex -> CloudFront
resource "aws_route53_record" "apex_a" {
  zone_id = var.zone_id
  name    = var.domain_name
  type    = "A"
  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex_aaaa" {
  zone_id = var.zone_id
  name    = var.domain_name
  type    = "AAAA"
  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# www -> CloudFront (redirected to apex by the CF Function)
resource "aws_route53_record" "www_a" {
  zone_id = var.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www_aaaa" {
  zone_id = var.zone_id
  name    = "www.${var.domain_name}"
  type    = "AAAA"
  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# api -> API Gateway regional domain
resource "aws_route53_record" "api_a" {
  zone_id = var.zone_id
  name    = var.api_domain_name
  type    = "A"
  alias {
    name                   = var.api_domain_target
    zone_id                = var.api_hosted_zone_id
    evaluate_target_health = false
  }
}
