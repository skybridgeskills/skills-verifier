# Single-table design for skills-verifier (Job + JobApplication).
# Wire `environment` from your root module or set a default.

variable "environment" {
  type        = string
  description = "Deployment environment name (e.g. dev, staging, prod)"
  default     = "dev"
}

resource "aws_dynamodb_table" "skills_verifier" {
  name         = "skills-verifier-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = true
  }
}

output "dynamodb_table_name" {
  value       = aws_dynamodb_table.skills_verifier.name
  description = "Set DYNAMODB_TABLE in the app to this value"
}
