variable "sourcecode_zip_path" {
  type = string
}

variable "credential_file_path" {
  type = string
  default = "default.json"
}

variable "project" {
  type = string
}

variable "region" {
  type = string
}

variable "name" {
  type = string
}

variable "memory" {
  type = number
}
