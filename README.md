# Keradon

A modern web application built with Next.js 15, featuring a robust tech stack for scalable development.

## 🚀 Features

- **Next.js 15** with App Router and Server Components
- **React 19** with concurrent features
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Firebase** for authentication and database
- **Modern UI components** with shadcn/ui

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.4
- **Language**: TypeScript 5.4.5
- **Styling**: Tailwind CSS 3.4.1
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **UI Components**: shadcn/ui
- **Icons**: Lucide React, React Icons
- **State Management**: React 19 built-in features

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18.17 or later
- npm or yarn package manager
- A Firebase project for authentication and database

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Firebase Configuration (Get these from Firebase Console > Project Settings > General)
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Get from Firebase Console > Project Settings > Service Accounts)
# For local development, use service account credentials:
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"

# For production (Vercel, etc.), you can use application default credentials:
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` should be the full private key including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts
- If you're deploying to Vercel, make sure to add these environment variables in your Vercel project settings
- The app will gracefully handle missing Firebase credentials by returning default data

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

3. **Set up Firebase and environment variables**
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication and Firestore Database
   - Create a `.env.local` file in the root directory with your Firebase credentials (see Environment Variables section)
   - **Important**: The `.env.local` file is automatically ignored by Git to keep your API keys private

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" and follow the setup wizard
3. Once created, click on your project to enter the dashboard

### 2. Enable Authentication

1. In the Firebase Console, go to **Authentication** > **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** provider
4. (Optional) Enable **Google** provider for OAuth

### 3. Enable Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in test mode** for development
3. Select a location for your database

### 4. Get Configuration Values

1. Go to **Project Settings** (gear icon) > **General** tab
2. Scroll down to "Your apps" section
3. Click on the web app icon (`</>`) to create a web app
4. Copy the configuration values to your `.env.local` file

### 5. Set up Admin SDK (for server-side operations)

1. Go to **Project Settings** > **Service Accounts** tab
2. Click **Generate new private key**
3. Download the JSON file and extract the `private_key` and `client_email` values
4. Add these to your `.env.local` file

## 🔐 Authentication

The application uses Firebase Auth for authentication. The following features are available:

- **Email/Password Authentication**: Traditional sign-up and sign-in
- **Google OAuth**: One-click authentication with Google (configure in Firebase Console)
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

- **Authentication**: Firebase Auth with Google OAuth
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
- **Firebase Documentation**: [https://firebase.google.com/docs](https://firebase.google.com/docs)
- **Tailwind CSS**: [https://tailwindcss.com](https://tailwindcss.com)
- **shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)