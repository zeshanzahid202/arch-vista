# ArchVista ko Vercel par live karna — one-time setup

GitHub repository: https://github.com/zeshanzahid202/arch-vista

## 1. MongoDB Atlas database

1. MongoDB Atlas account mein free cluster banayein.
2. Database Access mein application ke liye alag database user aur strong password banayein. Apna Atlas account password use na karein.
3. Connect → Drivers → Node.js se connection string lein. Database name `archvista` rakhein. Password ke special characters URL-encode hone chahiye.
4. Network Access mein application ki connections allow karein. Vercel ke default outbound IPs fixed nahin hote. Free-tier setup mein `0.0.0.0/0` allow karna ek option hai; is se database port internet se reachable hota hai, is liye database authentication aur strong, limited-permission credentials zaroori hain. Fixed egress IPs available hon to unhi ko allow karein. Initial admin/seed scripts ke liye apne computer ka IP bhi allow hona chahiye.

## 2. Vercel par GitHub repo import karein

1. https://vercel.com/new kholein aur GitHub se sign in karein.
2. `zeshanzahid202/arch-vista` import karein. Repo nazar na aaye to Vercel GitHub app ko us repository ka access dein.
3. Framework **Next.js**, Root Directory repository root (`./`), Node.js **24.x** select karein.
4. Install Command `npm ci`, Build Command `npm run build`. Output Directory ko default chhor dein; is project ke liye static export select na karein.

## 3. Required environment variables

Project → Settings → Environment Variables mein Production ke liye yeh values rakhein:

```dotenv
MONGODB_URI=mongodb+srv://DB_USER:URL_ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/archvista?retryWrites=true&w=majority
AUTH_SECRET=YOUR_RANDOM_SECRET
AUTH_URL=https://YOUR-ACTUAL-PROJECT.vercel.app
NEXT_PUBLIC_SITE_URL=https://YOUR-ACTUAL-PROJECT.vercel.app
```

Secret apne computer ke terminal mein generate karein:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

`AUTH_SECRET` ko private rakhein. `AUTH_URL` aur `NEXT_PUBLIC_SITE_URL` mein bilkul wahi HTTPS origin use ho jo Vercel ne diya ho. Agar URL pehli deployment ke baad maloom ho, dono values update karke **Redeploy** karein. Environment-variable updates pehle se chalti deployment ko automatically update nahin kartin.

Uploads ke liye Cloudinary dashboard se yeh teen server variables add karein:

```dotenv
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Email notifications ke liye apne SMTP provider ki values add karein:

```dotenv
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=
NOTIFICATION_EMAIL=
```

Cloudinary ke baghair uploads available nahin honge. SMTP ke baghair inquiry database mein save hogi, lekin email notification failed mark hogi; credentials configure karke retry script chala sakte hain. MongoDB ke baghair dynamic collections aur submissions functional nahin honge.

`ADMIN_PASSWORD` Vercel runtime mein add karna zaroori nahin. Isko sirf next step mein apne private local environment mein use karein. `.env.local`, secrets, local database files aur `node_modules` GitHub par upload nahin hote.

## 4. Admin aur initial content sirf ek baar banayein

ArchVista project folder mein PowerShell kholein:

```powershell
npm ci
Copy-Item .env.example .env.local
```

`.env.local` ko apne editor mein khol kar:

- `MONGODB_URI` mein **wahi Atlas database** rakhein jo Vercel use karega.
- `ADMIN_EMAIL` mein apna admin email.
- `ADMIN_NAME` mein apna naam.
- `ADMIN_PASSWORD` mein unique password: minimum 14 characters, maximum 72 UTF-8 bytes.

Phir:

```powershell
npm run admin:create
```

Portfolio ko sample content ke saath dekhna ho to:

```powershell
npm run seed
```

Seed 6 fictional project concepts, 7 sample services aur 3 fictional journal articles insert karta hai. Existing records ko overwrite nahin karta. Real studio launch se pehle sample material replace ya unpublish karein. Seed optional hai; seed skip karein to services/projects/articles CMS se add karein.

Admin banne ke baad `.env.local` se `ADMIN_PASSWORD` hata dein. Script dobara chalane par existing admin overwrite nahin hota.

## 5. Deploy aur live checks

Vercel mein **Deploy** karein. Build complete hone par:

1. Homepage, Projects, Services aur Journal kholein.
2. `/admin/login` par apne account se sign in karein.
3. Project draft save karein, publish karein, phir public page refresh karke verify karein.
4. Cloudinary configure ho to image upload aur unused image deletion test karein.
5. Contact aur consultation submit karein; dashboard mein saved records aur actual email arrival check karein.
6. Settings mein studio contact details, Homepage CMS mein copy aur SEO mein defaults update karein. Legal templates aur sample photography/content review karein.

Har successful GitHub push ke baad connected Vercel project nayi deployment banata hai. Production branch `main` rakhein. Custom domain baad mein Project → Settings → Domains mein add kar sakte hain; domain change par dono URL variables update karke redeploy karein.

## Common issues

- **Build failure:** Vercel build log ka pehla actual error dekhein; Node 24.x aur repository root confirm karein.
- **Database unavailable:** Atlas database user/password, encoded password, database name aur Network Access check karein. `localhost` wali URI Vercel par kaam nahin karegi.
- **Admin login fails:** admin production Atlas database mein bana ho, `AUTH_SECRET` set ho aur `AUTH_URL` actual HTTPS domain se match kare.
- **Form returns origin error:** `AUTH_URL` aur browser ka domain exactly match hone chahiye. `www` aur non-`www` ko mix na karein.
- **Uploads fail:** Cloudinary credentials aur 4 MB file limit check karein. Supported formats JPEG, PNG, WebP hain.
- **Email nahin aati:** SMTP credentials, verified sender aur notification email check karein. Pending/failed notification retry: `npm run email:retry` with matching database/SMTP values in `.env.local`.

Build aur validation status: [VERIFICATION.md](./VERIFICATION.md). Full architecture aur API documentation: [README.md](./README.md).

Official references:

- https://vercel.com/docs/git/vercel-for-github
- https://vercel.com/docs/environment-variables
- https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- https://www.mongodb.com/docs/atlas/security/ip-access-list/
