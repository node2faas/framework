
provider "google" {
  credentials = "${file("gcp.json")}"
  project     = var.project
  region      = var.region
  #region      = "us-central1"
}

resource "random_string" "bucket_name" {
 length = 3
 special = false
 upper = false
 lower = false
 number = true
}

resource "google_storage_bucket" "bucket" {
  name = "node2faas-${var.project}-bucket-${random_string.bucket_name.result}"
}

resource "google_storage_bucket_object" "archive" {
  name   = "index.zip-${var.project}-${var.name}"
  bucket = "${google_storage_bucket.bucket.name}"
  source = var.sourcecode_zip_path
}

resource "google_cloudfunctions_function" "function" {
  name                  = "node2faas-${var.project}-${var.name}"
  description           = "Automatic created by node2faas for process function -> ${var.name}"
  runtime               = "nodejs10"
  available_memory_mb   = var.memory
  source_archive_bucket = "${google_storage_bucket.bucket.name}"
  source_archive_object = "${google_storage_bucket_object.archive.name}"
  trigger_http          = true
  timeout               = 180
  entry_point           = var.name
  labels = {
    my-label = var.name
  }

  environment_variables = {
    CALL = var.name
  }
}

resource "google_cloudfunctions_function_iam_member" "invoker" {
  project = "${var.project}"
  region = "${var.region}"
  cloud_function = "${google_cloudfunctions_function.function.name}"

  role = "roles/cloudfunctions.invoker"
  member = "allUsers"
}
