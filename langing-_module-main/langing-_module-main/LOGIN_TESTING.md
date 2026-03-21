# Login Flow Testing Guide

Follow these steps to properly test the login functionality between the Landing Module and Dashboard Module.

## Prerequisites

1. **Environment Variables**: Set up all required environment variables in `langing-_module-main/.env`
2. **Firebase**: Ensure your Firebase Firestore database is set up and accessible
3. **Google OAuth**: Configure Google OAuth credentials in Google Cloud Console

## Step-by-Step Testing

### 1. Start the Landing Module

```bash
cd langing-_module-main
pnpm dev
```

This will start:
- Vite dev server on port 8081
- Express backend integrated with Vite

### 2. Start the Dashboard Module

In a separate terminal:

```bash
cd dashborad_module-main
bun run dev
```

The dashboard should start on port 3000.

### 3. Test Email/Password Login

1. Open http://localhost:8081/login in your browser
2. Enter a test email (e.g., test@example.com)
3. Enter a password (minimum 6 characters)
4. Click "Sign In"
5. **Expected Result**: You should be redirected to http://localhost:3000 (dashboard)

### 4. Test Email/Password Signup

1. Open http://localhost:8081/signup
2. Enter:
   - Full Name: Test User
   - Email: newuser@example.com
   - Password: testpass123
   - Confirm Password: testpass123
3. Click "Sign Up"
4. **Expected Result**: You should be redirected to http://localhost:3000

### 5. Test Google OAuth Login

1. Open http://localhost:8081/login
2. Click "Login with Google" button
3. Complete the Google authentication flow
4. **Expected Result**: You should be redirected to http://localhost:3000

### 6. Test Session Persistence

1. After logging in and being redirected to the dashboard, refresh the page
2. **Expected Result**: You should remain logged in and stay on the dashboard

## Debugging Common Issues

### Issue: Login button doesn't redirect

**Check:**
- Browser console for errors (F12 → Console tab)
- Network tab to see if the /auth/login request is successful
- Server logs in the landing module terminal

**Solution:**
```bash
# Restart the landing module
pnpm dev
```

### Issue: Google login doesn't work

**Check:**
- Google OAuth credentials are correct in `.env`
- `BASE_URL` in `.env` matches the callback URL in Google Cloud Console
- Firebase credentials are valid

**Solution:**
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
2. Check Google Cloud Console redirect URIs:
   - Should include: `http://localhost:8081/auth/google/callback`

### Issue: Redirect to dashboard fails

**Check:**
- Dashboard is running on port 3000
- Check network tab for 'localhost:3000' request
- Check if there are CORS errors

**Solution:**
```bash
# In dashboard terminal, verify it's running
bun run dev
```

### Issue: User data not saving in Firebase

**Check:**
- Firebase credentials in `.env` are correct
- Firestore database exists and is accessible
- Check browser console for specific error messages

**Solution:**
```bash
# Verify Firebase credentials
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CLIENT_EMAIL

# Test connection by checking server logs during signup
```

## Browser Developer Tools

### To check authentication:

1. Open DevTools (F12)
2. Go to Application tab
3. Check Cookies → localhost:8081
4. Look for session-related cookies

### To check network requests:

1. Open Network tab
2. Attempt login
3. Look for `/auth/login` or `/auth/google/callback` request
4. Check response status and body

## Troubleshooting Steps

| Problem | Check | Solution |
|---------|-------|----------|
| Blank page after login | Is dashboard running? | `bun run dev` in dashboard folder |
| 401 error on login | Are credentials correct? | Check email/password match in database |
| Google auth fails | Is BASE_URL correct? | Update `.env` BASE_URL and Google Console URLs |
| Session lost on page refresh | Are cookies enabled? | Enable cookies, check browser privacy settings |
| Firebase error | Are credentials set? | Copy Firebase credentials to `.env` |

## Network Flow Diagram

```
User fills login form
    ↓
Browser POST to http://localhost:8081/auth/login
    ↓
Landing server validates in Firebase
    ↓
Session created
    ↓
Response with success status
    ↓
Browser redirects to http://localhost:3000
    ↓
Dashboard loads
    ↓
(Optional) Dashboard checks session at landing server
```

## Success Indicators

✅ You know it's working when:

1. **Email login**: Form submission redirects to dashboard immediately
2. **Google login**: OAuth popup completes and redirects to dashboard
3. **Signup**: New user created in Firebase, redirects to dashboard
4. **Session**: Refreshing dashboard keeps you logged in
5. **Logout**: Logout redirects to landing page home

## Production Testing Checklist

- [ ] All environment variables set correctly
- [ ] Firebase database is secured with proper rules
- [ ] Google OAuth redirect URIs updated for production domain
- [ ] SESSION_SECRET is different from default
- [ ] HTTPS enabled in production
- [ ] Cookies set with `secure` flag in production
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting added to auth endpoints

## Need Help?

1. Check the AUTHENTICATION_SETUP.md file for configuration help
2. Review the server logs in both terminals
3. Open browser DevTools to check for JavaScript errors
4. Check Firebase console for database access errors
