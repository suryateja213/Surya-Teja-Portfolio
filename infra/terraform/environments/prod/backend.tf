# Remote state. COMMENTED until the bootstrap stack has created the bucket +
# lock table. After running `infra/terraform/bootstrap`, uncomment, set the
# names to match the bootstrap outputs, then run `terraform init -migrate-state`.

# terraform {
#   backend "s3" {
#     bucket         = "surya-portfolio-tfstate"
#     key            = "prod/terraform.tfstate"
#     region         = "us-east-1"
#     dynamodb_table = "surya-portfolio-tflocks"
#     encrypt        = true
#   }
# }
