# Keradon 

<div align="center">
  <div style="background-color: #18181B; display: inline-block; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <img src="public/logo-white.png" alt="Keradon Logo" width="200"/>
  </div>
</div>

A modern desktop application designed to make data analysis and data analytics easy through smart web scraping get your desired data quickly and efficiently
built with Next.js, Electron.js, and Tailwind CSS, featuring a beautiful UI powered by shadcn components and a L.L.M powered by Python integrated with Fast-API.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Electron](https://img.shields.io/badge/Electron-29.1.0-2C2E3B?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-1E1E1E?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-1E293B?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn](https://img.shields.io/badge/shadcn-UI-18181B?style=flat-square&logoColor=white)](https://ui.shadcn.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.2-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)

## Features

- 🚀 Next.js 15.3.3 for the frontend
- ⚛ Electron.js 29.1.0 for native application capabilities
- 🎨 Tailwind CSS 3.4.1 for styling
- 🎯 TypeScript 5.3.3 support
- 🛠️ shadcn components for UI elements
- ⚡ Supabase 2.39.7 for data management
- 🔐 NextAuth.js 4.24.7 for authentication
- ⚡ Fast-API 0.109.2 for L.L.M integration
- 📦 Modern development tooling

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

## Getting Started

1. Clone the repository:
```bash
git clone [your-repository-url]
cd keradon-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here # Generate using: openssl rand -base64 32

# Optional OAuth providers (if needed)
# GOOGLE_ID=your-google-client-id
# GOOGLE_SECRET=your-google-client-secret
# GITHUB_ID=your-github-client-id
# GITHUB_SECRET=your-github-client-secret

# Supabase Configuration
NEXT_SUPABASE_URL=your-project-url
NEXT_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Run the development server:
```bash
# For web development
npm run dev
# or
yarn dev

# For desktop app development
npm run electron
# or
yarn electron
```

5. Build the application:
```bash
npm run build
# or
yarn build
```

## Authentication

The application uses NextAuth.js for authentication. The following features are available:

- Credentials-based authentication
- Session management
- Protected routes
- Custom sign-in page

To use authentication in your components:

```typescript
'use client';
import { useSession, signIn, signOut } from "next-auth/react";

// Access session
const { data: session } = useSession();

// Sign in
await signIn();

// Sign out
await signOut();
```

## Available Scripts

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the Next.js application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run electron` - Start the Electron development environment

## Tech Stack

- **Framework**: Next.js 15.3.3
- **Desktop**: Electron.js 29.1.0
- **Styling**: Tailwind CSS 3.4.1
- **UI Components**: shadcn
- **Language**: TypeScript 5.3.3
- **Authentication**: NextAuth.js 4.24.7
- **Database**: Supabase 2.39.7
- **Package Manager**: npm/yarn

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, please open an issue in the repository. 
