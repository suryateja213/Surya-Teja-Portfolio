# Terraform state bootstrap

Creates the S3 bucket + DynamoDB lock table that hold remote state for the
`environments/prod` stack. **Run once, by a human, with admin credentials.**

This stack uses local state on purpose — it is the chicken that lays the
remote-state egg.

```bash
cd infra/terraform/bootstrap
terraform init
terraform apply        # review, then yes

# Note the outputs, then point environments/prod/backend.tf at them and run
#   cd ../environments/prod
#   terraform init -migrate-state
```

The bucket has `prevent_destroy = true` — to tear it down you must remove that
line first. Don't, unless you mean it.
