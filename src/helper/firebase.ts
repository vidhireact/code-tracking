import admin from "firebase-admin";

const serviceAccount = process.env.SERVICE_ACCOUNT_PATH;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const firebaseAdmin = admin;
