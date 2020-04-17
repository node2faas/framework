output "aws_url" {
  value       = module.node2faas-aws.function_url
  depends_on  = [
    aws
  ]
}

output "gcp_url" {
  value       = module.node2faas-gcp.function_url
  depends_on  = [
    gcp
  ]
}

output "azure_url" {
  value       = module.node2faas-azure.function_url
  depends_on  = [
    azure
  ]
}
