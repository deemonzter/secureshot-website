# SecureShot Website Routine Deployment

This is the repeatable deployment flow for routine website updates.

Repository: `deemonzter/secureshot-website`  
Production URL: `https://secureshotapp.com`  
Deployment method: GitHub Pages from `main` (`/` root), built by `pages build and deployment`.

## Prerequisites

- You are authenticated in GitHub CLI:

```bash
gh auth status
```

- You are in the website directory:

```bash
cd SecureShotWebsite
```

## 1) Review changes

```bash
git status --short
git diff
```

## 2) Commit changes

Use a clear message describing the user-visible update.

```bash
git add .
git commit -m "Update website copy and navigation behavior"
```

## 3) Deploy by pushing to main

```bash
git push origin main
```

Pushing to `main` triggers the GitHub Pages deployment workflow automatically.

## 4) Watch deployment with gh

```bash
gh run list --repo deemonzter/secureshot-website --limit 3
```

Copy the latest run ID, then watch it:

```bash
gh run watch <run-id> --repo deemonzter/secureshot-website --exit-status
```

## 5) Verify Pages status and live URL

```bash
gh api repos/deemonzter/secureshot-website/pages
```

Expected:
- `"status": "built"`
- `"html_url": "https://secureshotapp.com/"`

Then verify in browser:
- `https://secureshotapp.com/`
- `https://secureshotapp.com/privacy.html`
- `https://secureshotapp.com/terms.html`

## Quick one-liner flow

```bash
git add . && git commit -m "Update website content" && git push origin main
```

Then run:

```bash
gh run list --repo deemonzter/secureshot-website --limit 1
gh api repos/deemonzter/secureshot-website/pages
```

## Rollback (if needed)

If a bad change reaches production, revert and redeploy:

```bash
git log --oneline -5
git revert <bad-commit-sha>
git push origin main
```

## Common issues

- `gh: not logged in` -> run `gh auth login`.
- Deployment stuck/failing -> inspect run details:

```bash
gh run view <run-id> --repo deemonzter/secureshot-website --log
```

- Pages status not `built` yet -> wait and re-run:

```bash
gh api repos/deemonzter/secureshot-website/pages
```
