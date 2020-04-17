provider "aws" {
  version = "~> 2.0"
  region = var.region
  access_key = var.access_key
  secret_key = var.secret_key
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda-${var.region}-${var.name}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_lambda_function" "function" {
  filename         = var.sourcecode_zip_path
  function_name    = "node2faas-${var.name}"
  description      = "Function ${var.name} automaticly created by node2faas"
  role             = "${aws_iam_role.iam_for_lambda.arn}"
  handler          = "${var.name}.${var.name}"
  source_code_hash = "${filebase64sha256("${var.sourcecode_zip_path}")}"
  runtime          = "nodejs10.x"
}

resource "aws_api_gateway_rest_api" "rest" {
  name        = "node2faas-rest-${var.name}"
  description = "REST API for function ${var.name} automaticly created by node2faas"
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = "${aws_api_gateway_rest_api.rest.id}"
  parent_id   = "${aws_api_gateway_rest_api.rest.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = "${aws_api_gateway_rest_api.rest.id}"
  resource_id   = "${aws_api_gateway_resource.proxy.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id             = "${aws_api_gateway_rest_api.rest.id}"
  resource_id             = "${aws_api_gateway_method.proxy.resource_id}"
  http_method             = "${aws_api_gateway_method.proxy.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.function.invoke_arn}"
}

resource "aws_api_gateway_method" "proxy_root" {
  rest_api_id   = "${aws_api_gateway_rest_api.rest.id}"
  resource_id   = "${aws_api_gateway_rest_api.rest.root_resource_id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id             = "${aws_api_gateway_rest_api.rest.id}"
  resource_id             = "${aws_api_gateway_method.proxy_root.resource_id}"
  http_method             = "${aws_api_gateway_method.proxy_root.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.function.invoke_arn}"
}

resource "aws_api_gateway_deployment" "deploy" {
  depends_on = [
    "aws_api_gateway_integration.lambda",
    "aws_api_gateway_integration.lambda_root",
  ]

  rest_api_id = "${aws_api_gateway_rest_api.rest.id}"
  stage_name  = "${var.name}"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "node2faas-${var.name}"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.rest.execution_arn}/*/*"
}
