# Non-secret configuration. Secrets (jwt_secret, admin_password_hash) are passed
# via TF_VAR_* env vars or GitHub Environment secrets — never put them here.

domain_name = "kommugurisuryateja.com"
github_repo = "suryateja213/Surya-Teja-Portfolio"
admin_email = "kommugurisuryateja@gmail.com"

region               = "us-east-1"
table_name           = "surya-portfolio"
frontend_bucket_name = "surya-portfolio-frontend"
