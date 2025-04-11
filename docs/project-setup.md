## The Tech Stack ##

1. Frontend (React with Shadcn and TailwindCSS):

- Next.js is built on React, so it works seamlessly with Shadcn components and TailwindCSS.
- Shadcn CLI officially supports Next.js, making it easy to integrate Shadcn components into your project.
2. Backend (Serverless with Firebase Cloud Functions):

- Next.js supports serverless functions out of the box, which can complement Firebase Cloud Functions.
- You can use Firebase Cloud Functions for backend logic while keeping Next.js API routes for lightweight server-side logic.
3. Database (Firestore):

- Firestore integrates well with Next.js, and you can use Firebase SDKs to interact with Firestore directly from your React components or API routes.
4. Authentication (Firebase Authentication):

- Firebase Authentication works seamlessly with Next.js, and you can use Firebase SDKs to handle authentication flows (e.g., login, signup, and session management).
5. Flexibility:

- Next.js allows you to mix static site generation (SSG), server-side rendering (SSR), and client-side rendering (CSR), giving you flexibility in how you build your app.
6. Ecosystem and Community:

- Next.js has a large ecosystem and community, making it easy to find resources, libraries, and support for your tech stack.

## Initial project setup instructions ##

These are the steps taken to setup the project for development.

1. Create a new NextJS app

Run this command

> npx create-next-app@latest . --use-app

2. Install Tailwind

> npm install -D tailwindcss postcss autoprefixer
> npx tailwindcss init

- Update tailwind.config.js

```js
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- Create a global.css file

> mkdir styles

- Add Tailwind directives to styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. Add Shadcn components

> npx shadcn init

- Add the Form component

> npx shadcn add form

- Repeat for button and card

4. Install Firebase SDK

> npm install firebase

- Set up Firebase
- Create a firebaseConfig.ts to initialize Firebase

```ts
import { initializeApp } from 'firebase/app'
import { FirebaseApp } from 'firebase/app'

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
}

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig)

export default app
```
