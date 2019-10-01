provider "azurerm" {
  version = "=1.28.0"
  subscription_id = var.subscription_id
  client_id = var.client_id
  client_secret = var.client_secret
  tenant_id = var.tenant_id
}

resource "random_string" "rg_name" {
 length = 3
 special = false
 upper = false
 lower = false
 number = true
}

resource "azurerm_resource_group" "rg" {
 name = "node2faas${random_string.rg_name.result}"
 location = var.region
}

resource "azurerm_storage_account" "storage" {
 name = "node2faas${random_string.rg_name.result}"
 resource_group_name = "${azurerm_resource_group.rg.name}"
 location = "${azurerm_resource_group.rg.location}"
 account_tier = "Standard"
 account_replication_type = "LRS"
}

resource "azurerm_storage_container" "storage_container" {
 name = "node2faas${random_string.rg_name.result}"
 resource_group_name = "${azurerm_resource_group.rg.name}"
 storage_account_name = "${azurerm_storage_account.storage.name}"
 container_access_type = "blob"
}

resource "azurerm_storage_blob" "storage_blob" {
 name = "${var.name}zip"
 resource_group_name = "${azurerm_resource_group.rg.name}"
 storage_account_name = "${azurerm_storage_account.storage.name}"
 storage_container_name = "${azurerm_storage_container.storage_container.name}"
 type = "block"
 source = var.sourcecode_zip_path
}

data "azurerm_storage_account_sas" "storage_sas" {
  connection_string = "${azurerm_storage_account.storage.primary_connection_string}"
  https_only        = true

  resource_types {
    service   = false
    container = false
    object    = true
  }

  services {
    blob  = true
    queue = false
    table = false
    file  = false
  }

  start  = "2019-09-01"
  expiry = "2029-09-01"

  permissions {
    read    = true
    write   = false
    delete  = false
    list    = false
    add     = false
    create  = false
    update  = false
    process = false
  }
}

resource "azurerm_app_service_plan" "plan" {
 name = "node2faas${random_string.rg_name.result}"
 location = "${azurerm_resource_group.rg.location}"
 resource_group_name = "${azurerm_resource_group.rg.name}"
 kind = "functionapp"
 sku {
 tier = "Dynamic"
 size = "Y1"
 }
 depends_on = [azurerm_resource_group.rg]
}

resource "azurerm_application_insights" "insights" {
  name                = "node2faas${random_string.rg_name.result}"
  location            = "${azurerm_resource_group.rg.location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  application_type    = "Web"
  depends_on = [azurerm_resource_group.rg]
}

resource "azurerm_function_app" "function" {
  name = "node2faas${random_string.rg_name.result}"
  location = "${azurerm_resource_group.rg.location}"
  resource_group_name = "${azurerm_resource_group.rg.name}"
  app_service_plan_id = "${azurerm_app_service_plan.plan.id}"
  storage_connection_string = "${azurerm_storage_account.storage.primary_connection_string}"
  version = "~2"

  app_settings = {
    "APPINSIGHTS_INSTRUMENTATIONKEY" = "${azurerm_application_insights.insights.instrumentation_key}"
    "FUNCTION_APP_EDIT_MODE" = "readonly"
    "https_only" = true
    "HASH" = "${filebase64sha256("${var.sourcecode_zip_path}")}"
    "WEBSITE_NODE_DEFAULT_VERSION" = "10.14.1"
    "WEBSITE_USE_ZIP" = "https://${azurerm_storage_account.storage.name}.blob.core.windows.net/${azurerm_storage_container.storage_container.name}/${azurerm_storage_blob.storage_blob.name}${data.azurerm_storage_account_sas.storage_sas.sas}"
    "WEBSITE_RUN_FROM_PACKAGE" = "https://${azurerm_storage_account.storage.name}.blob.core.windows.net/${azurerm_storage_container.storage_container.name}/${azurerm_storage_blob.storage_blob.name}${data.azurerm_storage_account_sas.storage_sas.sas}"
  }
  depends_on = [azurerm_resource_group.rg]
}

resource "azurerm_template_deployment" "function_keys" {
  name = "node2fass${random_string.rg_name.result}"
  parameters = {
    "functionApp" = "${azurerm_function_app.function.name}"
  }
  resource_group_name    = "${azurerm_resource_group.rg.name}"
  deployment_mode = "Incremental"

  template_body = <<BODY
  {
      "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
      "contentVersion": "1.0.0.0",
      "parameters": {
          "functionApp": {"type": "string", "defaultValue": ""}
      },
      "variables": {
          "functionAppId": "[resourceId('Microsoft.Web/sites', parameters('functionApp'))]"
      },
      "resources": [
      ],
      "outputs": {
          "functionkey": {
              "type": "string",
              "value": "[listkeys(concat(variables('functionAppId'), '/host/default'), '2018-11-01').functionKeys.default]"                                                                                }
      }
  }
  BODY
}
