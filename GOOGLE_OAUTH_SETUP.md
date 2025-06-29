# Google OAuth Setup Guide

## 1. Create Google OAuth App

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`

## 2. Environment Variables

Add these to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Secret (generate a random string)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 3. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

## 4. Database Schema Update

Make sure your users table has these columns for OAuth support:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## 5. Test the Setup

1. Restart your development server: `npm run dev`
2. Go to the sign-in page
3. Click "Sign in with Google"
4. You should be redirected to Google's OAuth consent screen

## Troubleshooting

- **"redirect_uri_mismatch"**: Make sure your redirect URI in Google Console matches exactly
- **"invalid_client"**: Check your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- **Database errors**: Ensure the users table has the required OAuth columns

## Production Deployment

For production:
1. Update the redirect URI in Google Console to your production domain
2. Update NEXTAUTH_URL to your production URL
3. Ensure all environment variables are set in your hosting platform 