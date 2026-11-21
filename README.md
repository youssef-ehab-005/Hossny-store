# HOSSNY® Streetwear — JavaScript project

A complete JavaScript/JSX project scaffold using Next.js App Router, Firebase Authentication, Cloud Firestore, Firebase Admin, Cloudinary signing, and a Paymob integration placeholder.

## Run locally

- Node.js 20+
- `npm install`
- Copy `.env.example` to `.env.local` and fill in the values you have configured.
- `npm run dev`
- Open `http://localhost:3000`

## Firebase setup

1. Create a Firebase project and register a Web App.
2. Enable Authentication > Email/Password.
3. Create a Cloud Firestore database.
4. Add the Web App values to the `NEXT_PUBLIC_FIREBASE_*` variables.
5. Create a service account key and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` as server-only environment variables. Store the private key securely; never commit it.
6. Publish `firestore.rules` in Firestore > Rules.
7. Register an account, then create `users/{UID}` in Firestore with `uid`, `email`, `role: "admin"`, and `createdAt` to grant admin access.

## Vercel

Import the GitHub repository as a Next.js project. Add environment variables from `.env.example` in Project Settings > Environment Variables, then redeploy. Do not upload `.env.local` or service-account JSON files to GitHub.

## Included

- Responsive HOSSNY storefront landing page
- JavaScript/JSX only (no TypeScript files)
- Firebase browser SDK setup
- Lazy Firebase Admin SDK setup
- Firebase ID-token verification and Firestore role check
- Health endpoint
- Public product-list API
- Admin-only product-create API
- Admin-only Cloudinary signed-upload endpoint
- Paymob session endpoint placeholder
- Firestore security rules and collection notes

## Scope — read before launch

This is the full current starter project, but it is **not yet a finished production e-commerce system**. The storefront currently shows sample products. The following still need implementation and testing before accepting real orders/payments: customer registration/login screens, cart and checkout, order creation and tracking, wishlist, coupon validation, stock management, admin dashboard and order/customer management, and Paymob session creation plus verified payment webhook. Paymob must be implemented against the API version and credentials enabled for your merchant account. Never trust browser-submitted prices, totals, discounts, stock, or payment status.
