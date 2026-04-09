# KMS key for Skills Verifier SSM Parameter Store encryption
module "kms" {
  source  = "terraform-aws-modules/kms/aws"
  version = "~> 4.2.0"

  aliases = ["alias/${local.name-env-region}"]

  description = "Skills Verifier Environment Secrets"
  key_usage   = "ENCRYPT_DECRYPT"

  # Allow administrators from the account
  key_administrators = data.aws_iam_roles.administrators.arns

  # Allow ECS task roles to use the key for encrypt/decrypt
  key_users = [
    aws_iam_role.task.arn,
    aws_iam_role.task_execution.arn,
  ]

  tags = local.tags
}

# Data source to find IAM administrator roles
data "aws_iam_roles" "administrators" {
  name_regex  = "*admin*"
  path_prefix = "/"
}
