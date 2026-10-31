# Verification record

Performed October 31, 2026 in the Windows project workspace.

## Passed

- TypeScript checking, including the public routes, admin CMS, APIs and scripts.
- ESLint with no errors or warnings.
- A Next.js 16.4.3 production build: compilation, TypeScript, page-data collection and route generation completed successfully.
- Seven Vitest validation tests: contact consent/message, bot field, complete consultation fields, publication requirements, testimonial approval, file signatures/size, and rich HTML sanitization.
- `npm audit --omit=dev --json`: zero reported runtime dependency advisories after updating Auth.js to 5.0.0-beta.32 and the SMTP package to Nodemailer 10.3.1.

## Not verified

- Thirteen database integration cases are implemented but could not execute here. The initial MongoDB archive download timed out. After obtaining the official test executable, Windows restricted temporary file renames; moving storage into the workspace resolved startup, but the restricted environment then denied the local database connection (`connect EACCES 127.0.0.1`). A request to rerun tests with broader execution access was declined. No application test assertions were reached in these blocked integration runs.
- Playwright browser cases were written but not run because their isolated server also needs a working local database connection. No desktop/mobile screenshot review, measured accessibility score, or Core Web Vitals score is claimed.
- Live Atlas connectivity, Cloudinary upload/deletion, SMTP delivery, a deployed admin login/session, and a full publishing round trip need operator credentials and execution outside the current connection restriction.
- No site was deployed to Vercel or Sites. Vercel configuration and deployment instructions are included.

## Dependency follow-up

The full development tree still reports 16 moderate advisories, centered on minimatch used by ESLint tooling. The runtime-only audit is clean. No automatic force downgrade or incompatible major override was applied. Review patched lint-tool releases before production maintenance handoff.

## Reproduce

```powershell
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The unit and integration suites cache transformed files under `.local/vitest-cache`. Isolated test databases use `.local/test-databases` and never the operator’s configured database. Windows can optionally use the official MongoDB executable at `.local/mongodb/mongod.exe`; otherwise the test library downloads its normal platform-specific test binary. `scripts/prepare-test-db.mjs` retrieves only the executable entry from the official Windows ZIP using byte ranges and validates the ZIP entry CRC. Generated files under `.local` are ignored by Git.

Browser tests start their own disposable database and seed fictional content. The test-only account is provisioned solely inside that isolated database; it is not a production default account. Keep port 3000 free. The configuration uses installed Windows Edge when available, an explicitly configured browser path if supplied, or Playwright Chromium.

Before launch: complete `.env.local` / Vercel environment variables, create the owner account, replace sample content and photography as appropriate, complete studio legal/contact information, verify actual email arrival and media lifecycle, and finish the database/browser checks above.
