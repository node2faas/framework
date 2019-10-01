output "function_url" {
  value = "https://${azurerm_function_app.function.default_hostname}/api/${var.name}?code=${lookup(azurerm_template_deployment.function_keys.outputs, "functionkey")}"
}
