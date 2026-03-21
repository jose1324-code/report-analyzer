import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { getDb, initializeFirebase } from "./firebase-init";

// Initialize Firebase before setting up strategies
initializeFirebase();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = getDb();
        
        // Find or create user in Firestore
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false);
        }

        const userDoc = await db.collection('users').doc(email).get();
        let user = {
          id: profile.id,
          displayName: profile.displayName,
          email: email,
          provider: 'google',
        };

        if (!userDoc.exists) {
          // Create new user
          await db.collection('users').doc(email).set({
            id: profile.id,
            name: profile.displayName,
            email: email,
            provider: 'google',
            createdAt: new Date(),
          });
        } else {
          // Update existing user
          await db.collection('users').doc(email).update({
            lastLogin: new Date(),
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Google auth error:', error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

export default passport;