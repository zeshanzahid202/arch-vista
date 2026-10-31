# ArchVista

A single-repository Next.js App Router application for an architecture studio. Public pages, a protected CMS, MongoDB persistence, Auth.js credentials authentication, Cloudinary media, and SMTP notifications are implemented here. This repository needs service configuration and launch review before production use. It does not claim measured performance or verified professional credentials.

## Local setup

Prerequisites: Node.js 22.12 or newer, npm, and MongoDB. Docker is optional and provides a free local MongoDB instance.

```powershell
npm ci
Copy-Item .env.example .env.local
docker compose up -d
```

Set `AUTH_SECRET` to a random secret (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`). Set `MONGODB_URI` to your local database or MongoDB Atlas connection string. Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` for local work.

Set `ADMIN_EMAIL`, `ADMIN_NAME`, and a unique `ADMIN_PASSWORD` of at least 14 characters (maximum 72 UTF-8 bytes), then run:

```powershell
npm run admin:create
npm run seed
npm run dev
```

Visit `http://localhost:3000` and `http://localhost:3000/admin`. Remove `ADMIN_PASSWORD` from `.env.local` after initial setup. There is no public registration, automatic default account, or hardcoded password. The creation script refuses to overwrite an existing account. Password rotation in the Security page revokes existing sessions.

The seed inserts six **fictional concept projects**, seven sample services, and three **fictional editorial samples**. It uses illustrative Unsplash photography, inserts only missing slugs/keys, and preserves existing content. No testimonials, team identities, awards, or completed commissions are fabricated. Review and replace sample content before launch. A database is required for collections and submissions: missing connections produce empty/unavailable collection states and truthful API failures, never a fake successful submission.

## Architecture

```text
src/app/(public)/        Home, about, services, projects, studio, journal,
                        contact, consultation, privacy, terms and details
src/app/admin/login/    Public sign-in page
src/app/admin/(protected)/
                        Session-checked dashboard, CMS editors, security
src/app/api/            Public reads/submissions, Auth.js, protected CRUD
src/components/         Public navigation, footer, editorial components
src/features/admin/     Dashboard, resource management, Tiptap, image picker
src/features/forms/     Validated contact/consultation/newsletter forms
src/features/portfolio/ Server-rendered search, categories, pagination
src/features/studio/    About and studio storytelling
src/config/             Brand defaults and resource definitions
src/lib/                DB, authorization, validation, sanitization, SMTP
src/models/             Twelve domain models plus rate-limit storage
src/types/              Content, session and API types
scripts/                Seed, initial owner setup, email retries
tests/                  Validation, database integration and browser tests
public/                 Local asset directory
```

Mongoose reuses a connection promise per process, caps the connection pool, and includes indexed slugs, publication/category queries, timestamps, and audit records. Search escapes user-supplied regular expressions. Collections support bounded pagination. The current search uses indexed publication/category narrowing with escaped case-insensitive text matching; for very large portfolios, add Atlas Search.

## Working in the CMS

- **Projects / Services / Journal:** create or edit a record, choose media, provide a summary and rich content, then save a draft or publish. Published content appears immediately; mutations also invalidate Next.js layout caches. Drafts are excluded from public APIs. Slugs must be lowercase words separated by hyphens.
- **Media:** upload JPEG, PNG, or WebP files up to 4 MB (compatible with Vercel’s request limit). MIME and binary signatures are checked. The library stores folders, titles, alt text, image dimensions, and Cloudinary IDs. Content editors can choose uploaded images and reorder galleries. Deletion checks cover/gallery/rich-text and homepage/settings references before removing the remote image. Folder editing changes library organization, not Cloudinary IDs.
- **Testimonials / Team:** publish only authentic profiles and quotations with permission. Testimonials require explicit approval before publishing. Display order controls their position.
- **Homepage CMS:** create/edit the record with key `home`. Controls hero, introduction, philosophy and consultation CTA. Project featured flags, service order and testimonial approval curate the remaining collections.
- **Settings:** owner-only; create/edit key `studio` for name, contact details, address, social links, default description and footer text.
- **SEO:** owner-only; create/edit key `default` for defaults. Individual project/service/article editors have overrides, canonical URLs, social images and indexing flags.
- **Inquiries / Consultations:** search, filter, review briefs, update status and internal notes, or delete with confirmation. Newsletter subscription requests are stored as inquiries with kind `newsletter`; a marketing campaign sender is not included.
- **Security:** change your password. Owners can inspect audit events. Editors cannot change global settings or SEO. There is no public user-management interface; provision additional staff through a reviewed administrative process.

## APIs

Public: `GET /api/projects`, `/api/services`, `/api/articles`, and each `/{slug}` detail. List query parameters: `page`, `limit` (maximum 100), `q`, `category`, `featured=true`.

Submissions: `POST /api/contact`, `/api/consultations`, `/api/newsletter`. See `src/lib/validation.ts` for exact contracts. All require privacy consent and an Origin matching `AUTH_URL`. Browser forms send these automatically.

Admin: `GET/POST /api/admin/{resource}` and `GET/PATCH/DELETE /api/admin/{resource}/{id}` for projects, services, articles, testimonials, team, homepage, settings and SEO. Inquiries/consultations are read/update/delete only; media creation uses `POST /api/admin/upload`. Multipart upload fields: `file`, `alt`, `folder`. Dashboard: `GET /api/admin/dashboard`. Security: `GET/POST /api/admin/security`. Every endpoint independently validates the server-side session and current database account; protected pages do the same.

Responses use `error` and optional field errors for failed requests. Duplicate slugs return 409, invalid input 422, unauthenticated requests 401, forbidden operations 403, and unavailable services 503.

## External integrations

**MongoDB Atlas:** use a database-specific user with only necessary database permissions. Add your deployment’s network access according to Atlas guidance. Local Docker needs no paid account.

**Cloudinary:** set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` on the server. Upload and deletion remain unavailable until configured; secrets never enter browser bundles. Images use Next Image responsive delivery. Existing illustrative Unsplash images can render without Cloudinary credentials.

**Email:** set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, and `NOTIFICATION_EMAIL`. Port 465 uses TLS; 587 uses SMTP STARTTLS. Verify your sender domain with your email provider. Submissions are stored first; a failed notification is marked `failed` without losing the request or pretending an email was delivered. Run `npm run email:retry` to retry up to 100 pending/failed records per collection. Run only one retry worker at a time: a crash after SMTP delivery but before persistence may produce a duplicate notification. A hosted scheduler is not configured automatically.

**Auth.js:** this implementation uses the documented NextAuth v5 beta API (`5.0.0-beta.32` is pinned); assess its release status before launch. Sessions are JWT-based, HttpOnly, SameSite=Lax, and secure under production HTTPS. Roles and session version are rechecked against MongoDB. Account/IP login throttles and form throttles persist in MongoDB rather than process memory. Auth.js supplies CSRF protections for its sign-in/out flows; custom mutations enforce same-origin requests. Set `TRUST_PROXY=true` only behind a trusted ingress. Vercel’s ingress is detected automatically; untrusted direct hosting defaults to a shared `local` limiter bucket. The patched Nodemailer 10 SMTP dependency is installed under the `smtp-mailer` alias, keeping it separate from Auth.js’s unused optional email-provider peer dependency.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Vitest integration tests use an isolated ephemeral MongoDB instance, never your configured production database. The first run downloads a MongoDB test binary. Tests exercise actual queries and API handlers with a controlled session boundary. They cover password verification/throttling, unauthenticated routes, owner permissions, session revocation, project/article CRUD, publishing, duplicate slugs, escaped filtering, form validation, persisted requests, failed notification states, sanitization and media signature/size checks. Live Cloudinary and SMTP delivery are not exercised by these offline tests. Playwright checks public navigation, mobile overflow, consultation validation and protected-route redirects. A full real-browser administrator sign-in/upload/publish round trip against configured external services is still a launch check.

See `VERIFICATION.md` for the checks actually executed in this environment. Passing a build alone is not a production certification.

## Vercel deployment

1. Push this repository to your Git provider and import it into Vercel as a Next.js project. Use a supported Node 22+ runtime. The lockfile pins the dependency tree.
2. Create MongoDB Atlas, Cloudinary and SMTP configurations as needed. Set server environment variables in Vercel; never commit `.env.local`.
3. Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin and set a new `AUTH_SECRET`. Preview deployments need a matching origin and a separate database/credentials; do not use production submissions in previews.
4. Run the admin creation script from a secure machine against the production database. Do not seed fictional content into a live client portfolio unless explicitly intended.
5. Deploy with `npm run build`. Verify login/logout, roles, a draft/publish cycle, an image upload/delete, a contact submission and a consultation plus actual email arrival.
6. Replace all sample content, add true studio contact details, review the privacy/terms templates with the operator, confirm image rights and alt text, and inspect responsive layouts and Core Web Vitals on the deployed site.

Security headers include frame denial, MIME protection, referrer policy, restricted device permissions, and production HSTS. The baseline CSP permits inline scripts/styles for framework compatibility; eval is permitted only in development. Tighten to a tested nonce-based production CSP when deployment requirements are known. No analytics or advertising trackers are installed. The sitemap excludes unpublished/noindex dynamic content; robots disallows admin/API paths. Public routes intentionally render dynamically for immediate CMS updates; this trades some caching efficiency for consistency.

## Operational limitations and launch work

No real studio assets or credentials were supplied. There is no live deployment, verified email delivery, real client portfolio, fabricated analytics, or measured Lighthouse result. Legal pages explicitly require operator-specific completion. Optional maps, marketing email campaigns, password recovery by email, multi-factor authentication, advanced image transformations and scheduled retention purges are not implemented. The requested initial-admin script and authenticated password rotation are present. Keep database backups, dependency updates, service quotas and retention policies under operator control.
