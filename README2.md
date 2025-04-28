# Implementation Guide: Improved Authentication Flow

This guide provides step-by-step instructions for implementing the improved authentication workflow in your Hospital Blockchain Platform.

## Files to Update/Replace

| File Path | Action | Purpose |
|-----------|--------|---------|
| `/components/AppLayout.tsx` | Replace | Enhanced navigation with better user state handling |
| `/contexts/PatientDoctorContext.tsx` | Replace | Updated context with auth integration |
| `/pages/_app.tsx` | Replace | Improved app wrapper with auth checking |
| `/pages/auth/new-user.tsx` | Replace | Enhanced role selection experience |
| `/pages/auth/verify-request.tsx` | Replace | Better email verification UI |
| `/pages/api/auth/[...nextauth].ts` | Replace | Enhanced NextAuth configuration |
| `/pages/api/user/profile.ts` | Add | New API endpoint for profile management |

## Implementation Steps

### 1. Update Core Components

#### Replace AppLayout.tsx

```bash
cp improved-app-layout-final.tsx /components/AppLayout.tsx
```

The new AppLayout provides:
- Dynamic navigation based on user role
- Improved account dropdown menu
- Better wallet connection handling

#### Replace PatientDoctorContext.tsx

```bash
cp updated-patient-doctor-context.tsx /contexts/PatientDoctorContext.tsx
```

The updated context:
- Integrates with NextAuth for authentication
- Persists wallet connection in localStorage
- Provides role-based user information
- Maintains all existing blockchain functionality

#### Replace _app.tsx

```bash
cp improved-app-tsx.tsx /pages/_app.tsx
```

The enhanced _app.tsx:
- Adds comprehensive auth flow checking
- Redirects users to appropriate pages based on their state
- Improves error handling
- Maintains performance metrics logging

### 2. Update Authentication Components

#### Replace new-user.tsx (Role Selection)

```bash
cp new-user-page-improved.tsx /pages/auth/new-user.tsx
```

The improved role selection:
- Provides visual selection cards for roles
- Shows clearly which role is selected
- Integrates with localStorage for persistence
- Handles role changes

#### Replace verify-request.tsx (Email Verification)

```bash
cp verify-request-page-improved.tsx /pages/auth/verify-request.tsx
```

The enhanced verification page:
- Shows countdown timer for auto-checking
- Provides option to resend verification email
- Auto-redirects once verification is detected
- More user-friendly interface

#### Replace [...nextauth].ts

```bash
cp nextauth-config-improved.ts /pages/api/auth/[...nextauth].ts
```

The updated NextAuth config:
- Adds profile information to JWT and session
- Tracks user profiles in the database
- Better redirect handling
- Enhanced event logging

#### Add API Endpoint for Profile Management

```bash
mkdir -p /pages/api/user
cp user-profile-api.ts /pages/api/user/profile.ts
```

This new API endpoint:
- Creates and updates user profiles
- Stores role and wallet information
- Links NextAuth authentication with blockchain identity

### 3. Database Setup

Ensure your MongoDB connection is properly configured and working. The system will automatically create a `profiles` collection to store user information.

### 4. Environment Variables

Update your `.env.local` file to include all required variables:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Email provider
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@example.com
EMAIL_SERVER_PASSWORD=your-email-password
EMAIL_FROM=noreply@example.com

# OAuth providers (as needed)
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# MongoDB
MONGODB_URI=your-mongodb-connection-string
```

### 5. Test the Implementation

After deploying these changes, test the following scenarios:

#### New User Flow
1. Sign up with email
2. Verify email (test the auto-refresh)
3. Select a role (both doctor and patient paths)
4. Connect wallet
5. Complete profile

#### Returning User Flow
1. Sign in after logging out
2. Verify automatic redirection to the appropriate dashboard
3. Test wallet connection persistence

#### Profile Management
1. Update profile information
2. Test wallet connection/disconnection
3. Verify profile information is saved correctly

## Key Improvements

1. **Streamlined Authentication Flow**
   - Clear path from signup → verification → role selection → profile completion

2. **Better Role Management**
   - Clear separation between doctor and patient roles
   - Role information stored in both localStorage and database

3. **Improved Wallet Integration**
   - Wallet connections persist across sessions
   - Better error handling for blockchain interactions
   - Automatic reconnection on page reload

4. **Enhanced User Experience**
   - Modern, user-friendly interfaces
   - Clear visual indications of current process
   - Helpful error messages and guidance

5. **Robust Architecture**
   - Separation of concerns between authentication and blockchain
   - Proper data persistence
   - Comprehensive logging

## Troubleshooting

### Issue: Login not working
- Check your NextAuth configuration
- Verify email server settings if using email provider

### Issue: Profile not saving
- Check MongoDB connection
- Verify API routes are correctly implemented

### Issue: Wallet not connecting
- Ensure MetaMask or other wallet is installed
- Check console for blockchain-related errors

### Issue: Role selection not persisting
- Check localStorage access
- Verify the user ID is correctly being used as key

## Further Customization

You can customize the UI components to match your design system by modifying:
- Colors and theme in the components
- Layout and spacing
- Form fields in the profile forms

## Support

If you encounter any issues during implementation, refer to:
- NextAuth.js documentation: https://next-auth.js.org/
- Ethers.js documentation: https://docs.ethers.io/
- Chakra UI documentation: https://chakra-ui.com/docs/