# PG Wallpaper

Premium red/black glassmorphism wallpaper website with Firebase Authentication, Firestore catalog/favorites, dynamic categories, live site settings and PWA support.

## Media architecture

This build does **not** use Firebase Cloud Storage, so the website does not require Firebase Storage/Blaze for wallpaper files.

Actual wallpaper files are hosted on an external public image/CDN service. Firestore stores only the public `imageUrl` and optional `thumbnailUrl`.

The Admin Studio accepts a public original-image URL. The exact original URL is used for the Download button, so the site does not resize or recompress the downloaded file.

A true browser-to-CDN file upload (for example ImageKit) requires a secure server-side upload-auth endpoint; never put a CDN private key in GitHub or client JavaScript.

## Firebase setup

1. Enable Authentication → Email/Password.
2. Enable Firestore Database.
3. Publish `firestore.rules` in Firebase Console → Firestore Database → Rules.
4. Do **not** enable Firebase Storage for this build.

## Admin

Create/login to your account, then in Firestore open:

`users/{YOUR_FIREBASE_AUTH_UID}`

Set:

`role: "admin"`

Keep:

`isActive: true`

Admin Studio is protected by both client-side checks and Firestore rules.

## Live content

The public website listens to Firestore in real time. Changes made in Admin Studio to wallpapers, categories or `settings/site` appear on the live site without rebuilding GitHub Pages.

Settings include:
- site name
- site description
- Instagram
- YouTube
- Telegram
- Facebook
- X

Social URLs are rendered as clickable links.

## Wallpaper fields

- `imageUrl` — original/public wallpaper URL
- `thumbnailUrl` — optional optimized preview URL
- `title`
- `category`
- `tags`
- `device`
- `description`
- `featured`
- `isPublished`

## GitHub Pages

Upload the project files to the repository root and keep the `js` folder intact.

Repository → Settings → Pages → Deploy from branch → `main` → `/ (root)`.

## Security

The Firebase web API key is a client-side configuration value. Authorization is enforced by Firebase Authentication and Firestore Rules.

Never commit private API keys, service-account credentials, CDN private keys, GitHub tokens or other secrets.
