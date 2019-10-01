
provider "google" {
  credentials = "${file("gcp.json")}"
  project     = var.project
  #region      = var.region
  region      = "us-central1"
}

resource "google_storage_bucket" "bucket" {
  name = "node2fass-${var.project}-bucket"
}

resource "google_storage_bucket_object" "archive" {
  name   = "index.zip"
  bucket = "${google_storage_bucket.bucket.name}"
  source = var.sourcecode_zip_path
}

resource "google_cloudfunctions_function" "function" {
  name                  = var.name#"node2fass-${var.project}-${var.name}"
  description           = "Automatic created by node2faas for process function -> ${var.name}"
  runtime               = "nodejs10"
  available_memory_mb   = var.memory
  source_archive_bucket = "${google_storage_bucket.bucket.name}"
  source_archive_object = "${google_storage_bucket_object.archive.name}"
  trigger_http          = true
  timeout               = 60
  entry_point           = var.name
  labels = {
    my-label = var.name
  }

  environment_variables = {
    CALL = var.name
  }
}
