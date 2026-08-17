# PG Wallpaper

Premium wallpaper gallery built for GitHub Pages + Firebase.

## Before publishing

1. Keep the Firebase config in `js/firebase-config.js` for the existing `pg-wallpaper` project.
2. Enable **Email/Password** authentication in Firebase Authentication.
3. Create a Firestore database.
4. Create a Firebase Storage bucket.
5. Publish `firestore.rules` in Firestore Rules.
6. Publish `storage.rules` in Storage Rules.
7. Create your owner account through `signup.html`.
8. In Firebase Console → Firestore → `users` → your UID document, change `role` from `user` to `admin`. Do this manually; do not expose a client-side role editor.
9. In GitHub Pages, deploy the `main` branch from the repository root.

## Data model

- `users/{uid}` — profile and role
- `users/{uid}/favorites/{wallpaperId}` — personal favorites
- `wallpapers/{id}` — public wallpaper metadata
- `categories/{id}` — public categories
- Storage: `wallpapers/*` — uploaded image files

## Security

The UI hides admin tools from non-admin users, but the real protection is in Firestore and Storage Rules. Only the manually assigned `admin` role can write wallpaper/category data or upload/delete storage objects.

## GitHub Pages

All links are relative so the project works under `/pg-wallpaper/` without a custom domain.
