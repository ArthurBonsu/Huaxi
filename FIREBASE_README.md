# Firebase Integration Setup Guide

## Prerequisites
- Node.js (v14+ recommended)
- A Firebase account
- Next.js project

## Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard
4. Enable Firestore and Authentication

## Step 2: Install Dependencies
```bash
npm install firebase next-auth @next-auth/firebase-adapter
```

## Step 3: Configure Environment Variables
Create a `.env.local` file in your project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# OAuth Provider Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Email Provider (Optional)
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email_user
EMAIL_SERVER_PASSWORD=your_email_password
EMAIL_FROM=noreply@yourdomain.com
```

## Step 4: Authentication Providers Setup
1. Go to Firebase Console > Authentication
2. Enable desired sign-in methods:
   - Google
   - GitHub
   - Twitter
   - Email/Password

## Step 5: Firestore Database Setup
1. Create Firestore database
2. Set security rules to match your authentication needs

## Recommended Security Rules
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /accounts/{accountId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting
- Ensure all environment variables are correctly set
- Check Firebase Console for any configuration issues
- Verify OAuth provider credentials

## Additional Configuration
- Update `lib/firebaseNextAuthAdapter.ts` as needed for custom logic
- Modify `services/firebaseAuthService.ts` to add more authentication methods

## Production Deployment
- Set environment variables in your hosting platform
- Ensure NEXTAUTH_URL is set to your production domain
- Use secure, randomized NEXTAUTH_SECRET

## Notes
- Keep API keys and secrets confidential
- Never commit `.env.local` to version control
```