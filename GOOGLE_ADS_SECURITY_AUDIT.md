# Google Ads Security & Landing Page Audit — cartowingservicedubai.com

Audit date: 2026-10-27 · Scope: this repository + unauthenticated HTTP checks against production.
No server shell, Cloudflare/CDN, Search Console or Google Ads account access was available.

## A. Executive Summary

Ads 829435937711 (Search-6) and 829254259409 (Leads-Search-5) were disapproved for *Compromised site* and *Circumventing systems*, and `/car-towing/dubai` returned 404.

**No malicious code, injected scripts, cloaking, or deceptive redirects were found** in the repository or in what production serves. Production's `index.html` matches a fresh build of this repo, and it was byte-identical across desktop, mobile, Googlebot and AdsBot user agents.

Fixed in this change:
- `/car-towing/dubai` now returns a 301 redirect to the homepage. The route never existed in the app.
- 16 known dependency vulnerabilities were patched with non-breaking lockfile updates, including an XSS bypass in `sanitize-html`, which cleans blog HTML.
- An unused public account-registration API was closed.
- An HTML-injection bug in the booking notification email was fixed.
- Review-length limits were added.
- Standard security headers (HSTS, nosniff, frame and referrer policy) were added.

**No code root cause for the two policy flags was established.** The 404 is a confirmed bug, but there is no evidence it caused either policy flag. These flags are often account-level. See C and K.

## B. Confirmed Findings

| # | Severity | Finding | Evidence |
|---|---|---|---|
| 1 | Medium (ads) | `/car-towing/dubai` returns HTTP 404 | `client/src/App.jsx` has no such route. `client/nginx.conf` returns a real 404 for paths not on its allowlist. `git log -S "car-towing/dubai"` finds nothing, so the route never existed. Live: `HTTP/2 404`. |
| 2 | High | Vulnerable dependencies (client: axios, vite + 5 transitive; server: multer, sharp, nodemailer, sanitize-html, proxy-addr (critical), body-parser, qs and others) | `npm audit` before the fix: client had 7 high. Server had 1 critical, 6 high and 2 moderate. |
| 3 | Medium | `sanitize-html` XSS bypass (SMIL `javascript:` URI) | Blog content is rendered with `dangerouslySetInnerHTML` (`client/src/pages/BlogDetail.jsx:190`) after server sanitisation. Only admins can write blogs, so exploitation needs a compromised admin account. |
| 4 | Medium | Open `POST /api/users/register` lets anyone create an account and get a JWT | `server/routes/userRoutes.js`. Its own comment says *"Use this once… then remove/protect this route"*. The issued token can't pass `protectAdmin` (it requires `role: 'admin'`), and nothing else uses the `User` model, so there was no privilege escalation. Live endpoint confirmed reachable (`/api/users/login` → 401). |
| 5 | Medium | HTML injection into the owner's notification email | `server/utils/sendEmail.js` interpolated public booking-form fields into HTML without escaping, which allows phishing links in the owner's inbox. |
| 6 | Low | Public reviews have no length limits or moderation and are published immediately | `server/controllers/reviewController.js`, `server/models/Review.js`. This is a spam-injection vector. The live review list is currently empty (`GET /api/reviews` → `[]`). |
| 7 | Low | No security response headers | Live `curl -I /` shows only `server: nginx/1.31.3` (version exposed), with no HSTS or nosniff. |
| 8 | Info / policy risk | Hard-coded testimonials and unverified stats | `client/src/data/reviews.js` (4 named 5-star reviews) is shown on the homepage whenever the API returns no reviews, which is the case right now. `StatsBar.jsx` claims "10+ years, 5000+ clients, 50+ tow trucks". **The owner must confirm these are real.** If not, remove them: fabricated testimonials or claims break Google Ads *Misrepresentation* rules. Not changed, because the business content can't be verified from code. |

**Checked and clean:**
- **Scripts:** there are no `eval`, `new Function`, `atob`, `document.write`, iframes, injected script tags, or user-agent, referrer or geo logic in the source. `fromCharCode` matches in the live bundles are React and axios internals.
- **External domains** in the live HTML and JS: googletagmanager.com (G-585KJZ5NSP, AW-18519949039), fonts.googleapis.com and fonts.gstatic.com, wa.me (the business's own number), facebook.com and tiktok.com profile links, and schema.org, w3.org and react.dev strings inside libraries. All are expected.
- **Uploads:** admin-only, MIME-filtered, and re-encoded to WebP by sharp. Stored HTML or SVG payloads aren't possible.
- **Exposed files:** `/.env` and `/.git/config` return 404. No `.env` file is tracked in git.

## C. Root Cause Analysis

**Confirmed**
- 404: the route was never defined, and the client nginx correctly returns 404 for unknown paths. The URL most likely comes from a keyword-level or sitelink final URL, or another reference inside the Google Ads account. Nothing in this repo references it.

**Suspected or possible (unverified)**
- *Compromised site:* there is no evidence of a current compromise. Possible contributors: vulnerable packages (now fixed); an unauthenticated write endpoint (now closed); the server itself (OS packages, SSH, Docker, other sites on the same VPS). Server integrity can't be checked from the repo.
- *Circumventing systems:* no cloaking or deceptive redirects were found in code or in production responses. This policy is very often triggered by **account-level signals**: links to previously suspended accounts, payment or identity issues, repeated resubmission after disapproval, or a domain shared with another advertiser. Those are only visible inside Google Ads.

**Not established:** which specific signal Google used. Neither clean scans nor this audit prove it.

## D. Files Modified

| File | Change | Why it's safe |
|---|---|---|
| `nginx/default.conf` | `location ~ ^/car-towing/dubai/?$ { return 301 https://cartowingservicedubai.com/; }`, 4 security headers, `server_tokens off` | Same-domain permanent redirect to the equivalent page, in one hop. The headers don't restrict any scripts the site uses. No CSP was added, to avoid breaking gtag or Ads conversion tracking. |
| `server/server.js` | Removed the `/api/users` route mount | Not used by the client or the admin panel. The admin panel uses `/api/admin/login`. |
| `server/utils/sendEmail.js` | Added `escapeHtml()` for booking values in the notification email | Changes the email output only. A self-check passed. |
| `server/models/Review.js` | `trim` + `maxlength` (name/location 100, text 2000) | Real reviews fit easily. Over-length reviews are rejected with a validation error. |
| `client/package-lock.json`, `server/package-lock.json` | `npm audit fix`, non-breaking, without `--force` | Updates within the existing semver ranges only. The client build passes and the server modules load. |
| `GOOGLE_ADS_SECURITY_AUDIT.md` | This report | — |

Left in place, but now unreachable dead code for you to delete (file deletion was blocked in this session): `server/routes/userRoutes.js`, `server/controllers/userController.js`, `server/middleware/auth.js`, `server/models/User.js`.

## E. Security Audit Results

- **Dependencies:** client is at 0 vulnerabilities. Server has 1 remaining: **nodemailer ≤10.1.3** (address-parser DoS and parsing issues). The fix is a major upgrade to 10.x. It was not applied because recipients come only from server env vars (`NOTIFY_EMAIL`/`EMAIL_USER`), never from user input, so the advisories aren't reachable. Upgrade in a separate, tested change.
- **Lifecycle scripts:** none unexpected in direct dependencies. sharp's native install is expected.
- **Redirects:** HTTP→HTTPS and www→non-www are single 301s. Query strings such as `gclid` pass through with no redirect. There is no device, geo, user-agent or referrer branching anywhere.
- **CORS:** allows `CLIENT_URL`, its www variant, and any `localhost` origin. Auth uses a Bearer header, not cookies, so the risk is low. Consider dropping the localhost allowance in production.
- **Other low-severity items, not changed:**
  - The 500 handler returns `err.message` to clients.
  - Admin login has no rate limiting.
  - The admin review search builds a `RegExp` from raw input (admin-only, so ReDoS risk is low).
  - `client_max_body_size 100m` is larger than needed.

## F. Landing Page Results (production, run 2026-10-27, before deploy)

| URL | Status | Redirect chain | Final |
|---|---|---|---|
| `https://cartowingservicedubai.com/` | 200 | — | same |
| `https://cartowingservicedubai.com/?gclid=test123` | 200 | — | same |
| `http://cartowingservicedubai.com/` | 301 → 200 | 1 hop | `https://cartowingservicedubai.com/` |
| `https://www.cartowingservicedubai.com/` | 301 → 200 | 1 hop | `https://cartowingservicedubai.com/` |
| `https://cartowingservicedubai.com/car-towing/dubai` | **404** | — | same |
| `https://cartowingservicedubai.com/car-towing/dubai/` | **404** | — | same |
| `http://www.cartowingservicedubai.com/car-towing/dubai` | 301 → 404 | 1 hop | `https://cartowingservicedubai.com/car-towing/dubai` |
| `https://cartowingservicedubai.com/services/emergency-towing` | 200 | — | same |

Expected after deploy: `/car-towing/dubai` and `/car-towing/dubai/` → 301 → `/` (200). From http or www there are 2 hops: first to HTTPS non-www, then to `/`.

**Decision: redirect instead of a new page.** The homepage already *is* the Dubai car-towing page, with the same title, services, phone and booking form. A separate `/car-towing/dubai` page would duplicate it, which the task brief rules out. **Better still, change any Ads final URL that uses `/car-towing/dubai` to `https://cartowingservicedubai.com/`** so there's no redirect at all.

## G. Testing Results

| Test | Result |
|---|---|
| Client production build (`npm run build`) | ✅ Pass |
| Client lint (`npm run lint`) | ❌ 23 errors, all already present in files this change doesn't touch (mostly unused `React` imports) |
| Server syntax and module load (`node --check`, `require`) | ✅ Pass |
| Email escape self-check | ✅ Pass |
| `npm audit`: client / server | ✅ 0 / ⚠️ 1 high (nodemailer, see E) |
| Live redirect and status checks | ✅ Run (table F) |
| Live HTML parity across desktop, mobile, Googlebot and AdsBot user agents | ✅ Identical MD5. Limitation: this only proves the origin doesn't branch on user agent. Real Google traffic comes from Google IPs and may pass through any CDN or WAF rules not visible here. This is not a reproduction of Google's review environment. |
| Production `index.html` vs repo build | ✅ Same, apart from hashed asset names |
| `nginx -t` on the new config | ⛔ Not run: Docker isn't installed locally. It runs on the server during deploy, so check the nginx container logs. |
| Automated tests | ⛔ None exist (server `test` script is a placeholder) |
| Browser (Playwright) tests: navigation, forms, console errors | ⛔ Not run: Playwright isn't installed in the project |

## H. Deployment Instructions

Pushing to `main` triggers `.github/workflows/deploy.yml`. It connects to the Contabo VPS by SSH, runs `git reset --hard origin/main`, then `docker compose up -d --build`. No DB migration or env changes are needed.

1. Review and commit these changes, then push to `main`. Or run the workflow manually.
2. On the server: `docker compose ps` (all services Up), and `docker compose logs nginx | tail` (no config errors).
3. If Cloudflare or another CDN sits in front, purge the cache for `/` and `/car-towing/dubai`.
4. Post-deploy checks:
   ```bash
   curl -sI https://cartowingservicedubai.com/ | grep -iE 'HTTP|strict-transport|x-content-type'
   curl -sI https://cartowingservicedubai.com/car-towing/dubai | grep -iE 'HTTP|location'   # expect 301 → https://cartowingservicedubai.com/
   curl -sS -o /dev/null -w '%{http_code}\n' -X POST https://cartowingservicedubai.com/api/users/register   # expect 404
   ```
5. Submit a test booking and confirm the notification email arrives correctly.

## I. Google Ads Compliance Checklist

| Check | Status |
|---|---|
| Final URLs (`/`) resolve with 200 and no redirect | ✅ |
| Displayed domain matches the destination | ✅ Same domain, no intermediate domains |
| Tracking parameters don't cause redirects | ✅ Checked with `gclid` |
| No cloaking or user-agent branching (origin) | ✅ |
| No malicious or obfuscated third-party scripts in source or production bundles | ✅ |
| Known vulnerable dependencies | ✅ Fixed, except nodemailer (not reachable) |
| `/car-towing/dubai` | ✅ after deploy (301) |
| Consistent contact details (+971 58 672 9393) | ✅ Same number everywhere in code |
| Testimonials and stats are real | ⚠️ **Owner must confirm** (finding 8) |
| Server and OS integrity, CDN/WAF rules | ⚠️ Manual (K) |
| Account-level Circumventing-systems signals | ⚠️ Manual (K) |

## J. Google Ads Appeal Draft

> We reviewed cartowingservicedubai.com after the disapproval of ads 829435937711 and 829254259409.
>
> What we checked: we audited the full site source and the pages the live site serves. We found no malware, injected scripts, cloaking, or user-agent-, device- or referrer-based redirects. The homepage serves the same content to all visitors. The only redirects are the standard HTTP→HTTPS and www→non-www 301s on the same domain.
>
> What we fixed:
> (1) The URL /car-towing/dubai, which returned a 404, now permanently redirects to our homepage, which is our Dubai car-towing page.
> (2) We updated third-party software libraries with published security advisories.
> (3) We closed an unused account-registration endpoint, and added input escaping and length limits on public forms.
> (4) We added standard HTTPS security headers.
>
> The site provides 24/7 car towing and roadside assistance in Dubai. Contact number: +971 58 672 9393. We ask that the ads be reviewed again.

Only submit this after deployment is verified (H.4) and finding 8 is resolved. Don't claim malware was removed: none was found.

## K. Remaining Manual Actions

**Hosting (VPS):**
- Check for unexpected processes, cron jobs, users and SSH `authorized_keys`.
- Run `git status` in `/root/app` and confirm there are no local modifications.
- Confirm no other websites or containers on the VPS serve this domain.
- Update OS packages.
- Review nginx access logs for unusual paths or redirects.
- If Cloudflare is used, review Page, Redirect and Worker rules and Bot Fight Mode. Make sure nothing redirects or blocks `AdsBot-Google`.

**Content:** confirm or remove the hard-coded testimonials and stats (finding 8). Consider requiring admin approval before reviews are published (finding 6).

**Google Ads account:**
- Find where `/car-towing/dubai` is used (ad, keyword, sitelink or asset final URLs) and change it to `/`.
- Check Policy Manager for the exact evidence on each disapproval.
- Check Advertiser verification status, payment profile, and any links to suspended accounts or managers.
- Avoid repeated edits or resubmissions while under review.
- Contact Google Ads support for specifics on *Circumventing systems*, since that decision is often account-level.

**Code follow-ups:**
- Delete the dead user-auth files (D).
- Fix the existing lint errors.
- Upgrade nodemailer to 10.x in a tested change.
- Add rate limiting to admin login.
