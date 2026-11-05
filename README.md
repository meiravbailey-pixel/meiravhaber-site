# meiravhaber.com

Static site for Meirav Haber's art. It replaces the old Wix site and keeps the same look.

- **Generator:** [Eleventy](https://www.11ty.dev/) with Markdown/YAML content and Nunjucks templates.
- **Hosting:** GitHub Pages, which is free. `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
- **Editor:** [Pages CMS](https://pagescms.org), which is free and logs in with GitHub. It is configured in `.pages.yml`.

## Editing the site

### The easy way: Pages CMS

1. Go to https://app.pagescms.org, sign in with GitHub and open this repository.
2. **Artwork / Projects** has one entry per piece:
   - Pick a category: Character Fabrication, Painting, Drawing or Sculpting/Building.
   - Add a title and description.
   - Upload photos. The first photo is the thumbnail.
   - Optionally paste a YouTube or Vimeo link.
   - Use **Order** to set the position on the page (smaller numbers come first).
3. Save. The site rebuilds and is live in about 1–2 minutes.

Other sections:

- **Films:** the films page, with its videos and festival laurels.
- **Home page slideshow**
- **About page**
- **Site settings:** email, phone, Instagram and the other links.

Photos can be uploaded straight from a phone. The build makes web-sized WebP copies at most 2000px wide, plus thumbnails, so file size doesn't matter much. Uploads should be under about 20 MB each.

HEIC (iPhone) photos are not supported by browsers. Set the phone to "Most Compatible" (Settings → Camera → Formats) or export them as JPEG first.

### By hand

Each project is a file in `src/projects/<category>-<name>.md`:

```yaml
---
title: "Penny"
category: "character-fabrication"   # character-fabrication | painting | drawing | sculpting | online-store
description: "Designed, sculpted, and painted Penny for Robot Chicken"
images:
  - "/media/character-fabrication/penny.jpg"
video: ""            # optional YouTube/Vimeo link
project_date: ""     # optional, YYYY-MM-DD
order: 10
---
```

Images go in `media/`, which holds the masters (at most 2000px). The original full-size files are archived outside this repo.

## Run locally

```bash
npm ci
npm run serve      # http://localhost:8080
npm run build      # outputs to _site/
```

## Contact form (optional upgrade)

The contact page uses an **Email Meirav** (mailto) button plus the email address, phone and Instagram.

To get a real form without a backend:

1. Create a free form at https://formspree.io.
2. In `src/contact.njk`, replace the mailto block with:

```html
<form action="https://formspree.io/f/XXXXXXX" method="POST">…</form>
```

## Online Store (later)

The store is already wired up but hidden.

1. Add projects with category **Online Store**. A **Price** is optional.
2. In Site settings, turn on **Show the Online Store page**.

"Online Store" then appears in the top menu at `/online-store/`. To actually take payments, add Stripe Payment Links or Shopify Buy Buttons to the descriptions, or link to an Etsy or Big Cartel shop.

## Going live on meiravhaber.com (when ready)

1. Push this folder to a GitHub repository.
2. In the repository, open Settings → Pages and set Source to **GitHub Actions**.
3. The `CNAME` file already says `meiravhaber.com`. In Settings → Pages, enter `meiravhaber.com` as the custom domain.
4. At the DNS provider (GoDaddy):
   - Point the apex `@` with **A** records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
   - Point `www` with a **CNAME** to `<github-username>.github.io`.
   - Remove the old Wix records.
5. Tick **Enforce HTTPS** once the certificate is issued.
6. Then cancel the Wix plan. The domain stays at GoDaddy.

Old Wix addresses keep working: `/film`, `/about`, `/contact`, `/character-fabrication`, `/painting`, `/prop-building` (Drawing) and `/sculpting`.
