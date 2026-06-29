# Domain Identity

COSMOS-CQA has one canonical public URL:

```text
https://cosmos-cqa.org
```

All public references should prefer `https://cosmos-cqa.org`.

## Redirect Domains

The following domains are defensive aliases and should forward to the canonical URL with HTTPS enabled:

- `https://cosmoscqa.org` -> `https://cosmos-cqa.org`
- `https://cosmos-cqa.com` -> `https://cosmos-cqa.org`
- `https://cosmoscqa.com` -> `https://cosmos-cqa.org`

## Squarespace Setup Checklist

For each redirect domain in Squarespace:

1. Open the domain's DNS or forwarding settings.
2. Configure forwarding to `https://cosmos-cqa.org`.
3. Use a permanent redirect when Squarespace offers the option.
4. Enable SSL/HTTPS for the domain.
5. Verify both apex and `www` forms resolve or forward:
   - `https://cosmoscqa.org`
   - `https://www.cosmoscqa.org`
   - `https://cosmos-cqa.com`
   - `https://www.cosmos-cqa.com`
   - `https://cosmoscqa.com`
   - `https://www.cosmoscqa.com`

The canonical domain `cosmos-cqa.org` should be the only domain used in citation metadata, repository homepage fields, release notes, and public documentation.

## GitHub Pages DNS Handoff

The canonical domain is configured in GitHub Pages for this repository as:

```text
cosmos-cqa.org
```

When moving the canonical domain from a Squarespace-hosted placeholder to GitHub Pages, update the Squarespace DNS records for `cosmos-cqa.org` to GitHub Pages records.

Recommended apex `A` records for `cosmos-cqa.org`:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Optional apex `AAAA` records for IPv6:

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

Recommended `www` record:

```text
www.cosmos-cqa.org CNAME AI-Bio-Synergy-Holdings-LLC.github.io
```

Remove default Squarespace apex records before relying on GitHub Pages for the canonical site. After the first Pages deployment and DNS propagation, return to GitHub Pages settings and enable HTTPS enforcement once the certificate is available.

Verify DNS readiness from the repository with:

```bash
npm --prefix apps/web run pages:check-dns
```
