output "api_endpoint" {
  description = "Default execute-api endpoint (before custom domain)."
  value       = aws_apigatewayv2_api.this.api_endpoint
}

output "domain_target" {
  description = "Regional domain target for the Route53 alias record."
  value       = aws_apigatewayv2_domain_name.this.domain_name_configuration[0].target_domain_name
}

output "domain_hosted_zone_id" {
  description = "Hosted zone id of the API GW regional domain (for the alias record)."
  value       = aws_apigatewayv2_domain_name.this.domain_name_configuration[0].hosted_zone_id
}
