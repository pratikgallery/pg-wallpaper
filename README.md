# PG Wallpaper

Premium red/black glassmorphism wallpaper website with Firebase Authentication, Firestore favorites/catalog, Firebase Storage uploads, admin controls, and PWA support.

## Final corrected build

This build fixes:
- Homepage auth-state function mismatch.
- Account page imports/function mismatch.
- Missing Firebase Storage initialization.
- Missing admin authentication helpers.
- Existing-user profile repair after login.
- PWA cache version bump.
- Admin wallpaper upload/delete flow wiring.

## Firebase setup

1. In Firebase Console, open project `pg-wallpaper`.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create/enable **Firestore Database**.
4. Create/enable **Storage**.
5. Publish the contents of `firestore.rules` in Firestore Rules.
6. Publish the contents of `storage.rules` in Storage Rules.

Uploading these rule files to GitHub does **not** publish them to Firebase; they must be deployed/published in Firebase Console (or with Firebase CLI).

## Make an account an admin

After creating your account, open Firestore:

`users/{YOUR_FIREBASE_AUTH_UID}`

Change:

`role: "user"`

to:

`role: "admin"`

Keep:

`isActive: true`

Do not add admin controls to the client-side code to bypass this check. Admin authorization is enforced by Firestore/Storage rules.

## GitHub Pages

Upload the contents of this ZIP to the repository root. Keep the `js` directory intact.

Then use:

**Repository → Settings → Pages → Deploy from branch → main → / (root)**

The site will be served from the GitHub Pages project URL.

## Important

The Firebase web API key in `js/firebase-config.js` is a client-side Firebase configuration value. Security comes from Firebase Authentication and the Firestore/Storage rules, not from hiding this value.

Do not put Firebase service-account private keys, private API credentials, or GitHub tokens in this repository.
