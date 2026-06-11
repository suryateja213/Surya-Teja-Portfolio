output "apex_fqdn" {
  value = aws_route53_record.apex_a.fqdn
}

output "api_fqdn" {
  value = aws_route53_record.api_a.fqdn
}
