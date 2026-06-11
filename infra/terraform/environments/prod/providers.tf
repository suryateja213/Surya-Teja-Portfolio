# Primary region is us-east-1, so app resources and the CloudFront cert share a
# region. The `us_east_1` alias is kept explicit so the CloudFront cert module is
# unambiguous and the setup stays portable if the primary region ever changes.

provider "aws" {
  region = var.region
  default_tags {
    tags = var.tags
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
  default_tags {
    tags = var.tags
  }
}
