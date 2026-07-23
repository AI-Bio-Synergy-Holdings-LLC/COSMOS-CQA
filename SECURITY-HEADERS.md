# Security header deployment

The repository includes a Render Blueprint in `render.yaml`. `apps/web/_headers` remains in the Pages artifact for other compatible static hosts.

GitHub Pages does not apply custom response headers from repository files. Deploy the Render Blueprint, verify the generated service URL, and then move `cosmos-cqa.org` DNS to Render. Treat these controls as active only after the production response headers have been verified.

Required production controls are CSP, Permissions-Policy, Referrer-Policy, HSTS, X-Content-Type-Options, and clickjacking protection.
