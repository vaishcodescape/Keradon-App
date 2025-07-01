# Keradon

A modern web application built with Next.js 15, featuring a robust tech stack for scalable development.

## 🚀 Features

- **Next.js 15** with App Router and Server Components
- **React 19** with concurrent features
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for authentication and database
- **Modern UI components** with shadcn/ui

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.4
- **Language**: TypeScript 5.4.5
- **Styling**: Tailwind CSS 3.4.1
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui
- **Icons**: Lucide React, React Icons
- **State Management**: React 19 built-in features

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18.17 or later
- npm or yarn package manager
- A Supabase project for authentication and database

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth (for Supabase)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🏃‍♂️ Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd keradon-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and Google OAuth credentials

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

The application uses Supabase Auth for authentication. The following features are available:

- **Email/Password Authentication**: Traditional sign-up and sign-in
- **Google OAuth**: One-click authentication with Google
- **Session Management**: Automatic session handling and refresh
- **Protected Routes**: Middleware-based route protection

### Usage Example

```tsx
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
}
```

## 📁 Project Structure

```
src/
├── app/                 # App Router pages and layouts
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── lib/                # Utility functions and configurations
│   ├── auth/           # Authentication utilities
│   ├── config/         # Configuration files
│   └── hooks/          # Custom React hooks
└── types/              # TypeScript type definitions
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for consistent, accessible UI components:

- **Authentication**: Supabase Auth with Google OAuth
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React for consistent iconography

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js:

- **Netlify**: Use the Next.js build plugin
- **Railway**: Connect your GitHub repository
- **DigitalOcean App Platform**: Deploy directly from GitHub

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)