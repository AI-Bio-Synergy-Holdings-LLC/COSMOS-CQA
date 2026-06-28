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
