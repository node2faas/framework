variable "sourcecode_zip_path" {
  type = string
}

variable "project" {
  type = string
  default = null
}

variable "access_key" {
  type = string
  default = null
}

variable "secret_key" {
  type = string
  default = null
}

variable "region" {
  type = string
}

variable "name" {
  type = string
}

variable "memory" {
  type = number
  default = 256
}

variable "subscription_id" {
  type = string
  default = null
}

variable "client_id" {
  type = string
  default = null
}

variable "client_secret" {
  type = string
  default = null
}

variable "tenant_id" {
  type = string
  default = null
}
