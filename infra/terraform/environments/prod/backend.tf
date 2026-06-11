# Remote state, created by the bootstrap stack. Bucket name is account-suffixed
# for global uniqueness. To re-init from scratch: `terraform init`.

terraform {
  backend "s3" {
    bucket         = "surya-portfolio-tfstate-626635433373"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "surya-portfolio-tflocks"
    encrypt        = true
  }
}
