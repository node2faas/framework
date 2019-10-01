module "node2faas-gcp" {
  source = "./modules/gcp"
  sourcecode_zip_path = var.sourcecode_zip_path
  project = var.project
  region = var.region
  name = var.name
  memory = var.memory
}

module "node2faas-aws" {
  source = "./modules/aws"
  sourcecode_zip_path = var.sourcecode_zip_path
  access_key = var.access_key
  secret_key = var.secret_key
  region = var.region
  name = var.name
  memory = var.memory
}

module "node2faas-azure" {
  source = "./modules/azure"
  sourcecode_zip_path = var.sourcecode_zip_path
  subscription_id = var.subscription_id
  client_id = var.client_id
  client_secret = var.client_secret
  tenant_id = var.tenant_id
  region = var.region
  name = var.name
}
