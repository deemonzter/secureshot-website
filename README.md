# SecureShot Website

Official website for SecureShot - Privacy Policy, Terms of Service, and landing page.

## Deployment Instructions

### 1. Create GitHub Repository

```bash
# Navigate to the website directory
cd website

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: SecureShot website"

# Create a new repository on GitHub:
# Go to https://github.com/deemonzter
# Click "New repository"
# Name it: secureshot-website
# Make it Public
# DON'T initialize with README

# Link local repo to GitHub and push
git remote add origin https://github.com/deemonzter/secureshot-website.git
git branch -M main
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repository: `https://github.com/deemonzter/secureshot-website`
2. Click **Settings** tab
3. Click **Pages** in left sidebar
4. Under **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
   - Click **Save**

Your site will be live at: `https://deemonzter.github.io/secureshot-website`

### 3. Connect Custom Domain (secureshotapp.com)

#### On GitHub:
1. Still in **Settings** → **Pages**
2. Under **Custom domain**, enter: `secureshotapp.com`
3. Click **Save**
4. Wait for DNS check (may take a few minutes)
5. Once verified, check **Enforce HTTPS**

#### On GoDaddy:
1. Log in to GoDaddy
2. Go to **My Products** → **DNS** for secureshotapp.com
3. **Delete or modify these existing records** (if they exist):
   - Any `A` records pointing to GoDaddy parking
   - Any `CNAME` for `@` or `www`

4. **Add these NEW records:**

   **For root domain (@):**
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   TTL: 600 seconds

   Type: A
   Name: @
   Value: 185.199.109.153
   TTL: 600 seconds

   Type: A
   Name: @
   Value: 185.199.110.153
   TTL: 600 seconds

   Type: A
   Name: @
   Value: 185.199.111.153
   TTL: 600 seconds
   ```

   **For www subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: deemonzter.github.io
   TTL: 600 seconds
   ```

5. Click **Save** for each record

#### Wait for DNS Propagation
- Usually takes 5-30 minutes
- Can take up to 48 hours
- Check status: https://dnschecker.org

### 4. Verify Everything Works

Once DNS propagates, test these URLs:
- ✅ `https://secureshotapp.com` (homepage)
- ✅ `https://www.secureshotapp.com` (should redirect to above)
- ✅ `https://secureshotapp.com/privacy.html` (Privacy Policy)
- ✅ `https://secureshotapp.com/terms.html` (Terms of Service)

### 5. Use These URLs in App Store Connect

When submitting to Apple:
- **Privacy Policy URL:** `https://secureshotapp.com/privacy.html`
- **Terms of Service URL:** `https://secureshotapp.com/terms.html`
- **Support URL:** `https://secureshotapp.com`

## Updating Content

To update the website:

```bash
# Make changes to HTML files
# Then commit and push

git add .
git commit -m "Update privacy policy"
git push

# Changes will be live in 1-2 minutes
```

## File Structure

```
website/
├── index.html       # Homepage
├── privacy.html     # Privacy Policy
├── terms.html       # Terms of Service
├── styles.css       # Styling
├── CNAME           # Custom domain configuration
└── README.md       # This file
```

## Troubleshooting

### "Domain not verified" error
- Wait longer for DNS propagation
- Double-check DNS records in GoDaddy
- Try removing and re-adding custom domain in GitHub

### "Not secure" warning
- Make sure to check "Enforce HTTPS" in GitHub Pages settings
- Wait a few minutes for certificate provisioning

### Website not loading
- Check if GitHub Pages is enabled
- Verify branch is set to `main` and folder to `/ (root)`
- Check DNS records are correct

### Email forwarding not working
- If using Cloudflare email routing, make sure MX records don't conflict
- Test emails: send to `privacy@secureshotapp.com`

## Support

For issues with the website:
- GitHub Pages: https://docs.github.com/en/pages
- Custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

---

**SecureShot** — Your privacy is our architecture.

