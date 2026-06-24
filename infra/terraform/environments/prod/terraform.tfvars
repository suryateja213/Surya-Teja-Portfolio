# Non-secret configuration. Secrets (jwt_secret, admin_password_hash,
# anthropic_api_key) are passed via TF_VAR_* env vars sourced from GitHub
# repository secrets — never put them here.

domain_name = "kommugurisuryateja.com"
github_repo = "suryateja213/Surya-Teja-Portfolio"
admin_email = "kommugurisuryateja@gmail.com"

region               = "us-east-1"
table_name           = "surya-portfolio"
frontend_bucket_name = "surya-portfolio-frontend"
