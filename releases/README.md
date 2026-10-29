# Namecheap storefront build

`insignia-stay-web-production.zip` contains the frontend built from source commit `bbeb9ca`, configured for `https://portal.insigniacourts.com/api`. It includes the Apache `.htaccess` rules and payment return page. It contains no backend code or environment files.

From a private clone of this repository on Namecheap:

```bash
git fetch origin
git switch fix/remove-checkout-fees
git pull --ff-only origin fix/remove-checkout-fees
sha256sum -c releases/insignia-stay-web-production.sha256
```

Back up the existing storefront files. Replace the destination below with the actual document root assigned to `stay.insigniacourts.com` in cPanel, then extract:

```bash
unzip -o releases/insignia-stay-web-production.zip -d /FULL/PATH/TO/STAY_DOCUMENT_ROOT
```

Extract the ZIP contents directly into that document root, without an extra `dist` folder. Keep the repository clone and ZIP outside the public document root. Verify `/login`, `/payment-complete` and a real room/product detail URL after uploading. This publishes only the storefront; the Laravel backend, migrations, SMTP, queue and payment credentials require their separate setup.
