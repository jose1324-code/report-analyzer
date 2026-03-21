import admin from "firebase-admin";

// Initialize Firebase Admin once at startup
let initialized = false;
let hasValidCredentials = false;

// Mock in-memory database for testing
const mockUsers: Record<string, any> = {};

export function initializeFirebase() {
  if (initialized || admin.apps.length > 0) {
    return;
  }

  try {
    // Check if we have valid credentials
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        } as any),
      });
      hasValidCredentials = true;
      initialized = true;
      console.log('✓ Firebase initialized successfully');
    } else {
      console.log('⚠ Firebase credentials not configured - using in-memory storage');
      initialized = true;
    }
  } catch (error) {
    console.log('⚠ Firebase initialization failed - using in-memory storage');
    initialized = true;
  }
}

export const getDb = () => {
  if (!hasValidCredentials) {
    // Return a mock db object for testing
    return createMockDb();
  }
  if (admin.apps.length === 0) {
    initializeFirebase();
  }
  return admin.firestore();
};

function createMockDb() {
  return {
    collection: (name: string) => ({
      doc: (docId: string) => {
        return {
          get: async () => {
            const exists = !!mockUsers[docId];
            return {
              exists,
              data: () => (exists ? mockUsers[docId] : undefined),
              id: docId,
            };
          },
          set: async (data: any) => {
            mockUsers[docId] = data;
            console.log(`✓ User created: ${docId}`);
          },
          update: async (data: any) => {
            if (mockUsers[docId]) {
              mockUsers[docId] = { ...mockUsers[docId], ...data };
              console.log(`✓ User updated: ${docId}`);
            }
          },
        };
      },
    }),
  };
}

export function getMockUsers() {
  return mockUsers;
}

export default admin;


