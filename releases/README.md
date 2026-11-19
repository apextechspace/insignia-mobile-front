# Namecheap storefront build

## Guest booking review build

The reservation-policy update requires backend migration `2026_11_19_000001_add_reservation_terms`. It displays owner-enabled cancellation wording before payment and an optional VAT-inclusive label. Neither label changes the final room price. Online checkout still requires full payment; staff night-based deposits are configured in the owner's portal. Deploy both repositories before activating the new policy.

The November 19 wording update formats booking cards with singular/plural Night/Nights, a separate nightly rate, `Total: ₦… (… Nights)`, and Select Room or Select Suite according to the accommodation type. It does not change pricing or deposit rules.

The November 18 room-offer update adds an optional discount badge to room listings, room details, and booking search. It requires backend migration `2026_11_18_000003_add_room_discount_badges`. The owner-entered nightly price remains the final amount; the badge does not add VAT or deduct a discount. Turning the badge off leaves the price unchanged. Existing bookings and payment calculations are preserved.

`insignia-stay-guest-booking-preview.zip` is the review build from `feature/guest-booking`. It includes date-based availability, guest details, email sign-in, checkout holds and returning dashboard access. It targets the production API, but must only be deployed after the matching backend branch and `2026_10_30_000001_add_guest_checkout_access` migration are approved and deployed. Live SMTP and gateway behavior still require deployment smoke tests. The existing production ZIP below remains the previous deployed version.

Verify the review build with `sha256sum -c releases/insignia-stay-guest-booking-preview.sha256`. See backend `docs/GUEST_BOOKING_IMPLEMENTATION.md` for the release order and operational checks.

## Previous production build

`insignia-stay-web-production.zip` contains the frontend built from the accompanying source on `fix/remove-checkout-fees`, configured for `https://portal.insigniacourts.com/api`. It includes the Apache `.htaccess` rules and payment return page. It contains no backend code or environment files.

The October 29 layout update removes the nested disabled service list that blocked touch scrolling, gives bottom navigation labels enough height above the safe area, and adds side padding to the Shop Selection heading and View Shop link. Decorative room gallery overlays allow gestures through to the photos.

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
