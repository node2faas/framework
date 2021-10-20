output "aws_url" {
  value       = module.node2faas-aws.function_url
  depends_on  = [
    module.node2faas-aws.function_url
  ]
}

output "gcp_url" {
  value       = module.node2faas-gcp.function_url
  depends_on  = [
    module.node2faas-gcp.function_url
  ]
}

output "azure_url" {
  value       = module.node2faas-azure.function_url
  depends_on  = [
    module.node2faas-azure.function_url
  ]
}
