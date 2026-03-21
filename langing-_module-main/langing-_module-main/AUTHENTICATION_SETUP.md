# Authentication Setup Guide

This guide explains how to properly set up authentication between the Landing Module and Dashboard Module.

## Architecture Overview

- **Landing Module** (Port 8081): Handles user authentication (login, signup, Google OAuth)
- **Dashboard Module** (Port 3000): Main application where users are redirected after login

## Setup Steps

### 1. Environment Variables

Copy the `.env.example` file to `.env` and fill in the required values:

```bash
cp .env.example .env
```

**Required Environment Variables:**

- `BASE_URL`: The URL of the landing server (default: `http://localhost:8081`)
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `FIREBASE_PROJECT_ID`: Your Firebase Project ID
- `FIREBASE_PRIVATE_KEY`: Your Firebase Private Key
- `FIREBASE_CLIENT_EMAIL`: Your Firebase Client Email
- `SESSION_SECRET`: A secret key for session management

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add the following redirect URIs:
   - Development: `http://localhost:8081/auth/google/callback`
   - Production: `https://your-domain.com/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Create a Firestore database
4. Create a service account key:
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Copy the credentials to your `.env` file

### 4. Running the Application

**Terminal 1 - Landing Module:**
```bash
cd langing-_module-main
npm install  # or pnpm install
pnpm dev
```

**Terminal 2 - Dashboard Module:**
```bash
cd dashborad_module-main
bun install
bun run dev
```

### 5. Testing the Login Flow

1. Open http://localhost:8081 in your browser
2. Go to the Login page
3. Test the following:
   - **Email/Password Login**: Sign in with email and password
   - **Google Login**: Click "Login with Google" and complete the OAuth flow
   - **Sign Up**: Create a new account
4. After successful login, you should be redirected to http://localhost:3000

## Authentication Flow

### Email/Password Authentication
```
User submits form
    ↓
Landing server validates credentials
    ↓
User stored in Firebase
    ↓
Session created in Express
    ↓
Redirect to Dashboard (localhost:3000)
```

### Google OAuth Flow
```
User clicks "Login with Google"
    ↓
Google OAuth callback to landing server
    ↓
User data stored/updated in Firebase
    ↓
Session created via Passport
    ↓
Redirect to Dashboard (localhost:3000)
```

## Troubleshooting

### "Redirect URI mismatch" Error
- Ensure the `GOOGLE_CALLBACK_URL` matches exactly in Google Cloud Console
- For localhost development: `http://localhost:8081/auth/google/callback`

### "User not found after redirect" 
- Check that Firebase credentials are correct
- Verify that the session middleware is properly configured
- Ensure cookies are enabled in your browser

### "Connection refused to localhost:3000"
- Make sure the Dashboard Module is running on port 3000
- Check that there are no port conflicts

### Users not persisting
- Check Firebase Firestore database
- Verify Firebase credentials in `.env`
- Check browser console for errors

## Security Considerations

- Never commit `.env` file to version control
- Use strong SESSION_SECRET in production
- Keep Google OAuth credentials secure
- Use HTTPS in production
- Set secure cookie options in production environment

## Production Deployment

For production deployment:

1. Update `BASE_URL` and `DASHBOARD_URL` to your production domains
2. Update Google OAuth redirect URIs with production domain
3. Use environment-specific configuration files
4. Ensure HTTPS is enabled
5. Set secure session cookie options
6. Use a production-grade session store (not in-memory)

## Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Review the Copilot Instructions in `.github/copilot-instructions.md`
