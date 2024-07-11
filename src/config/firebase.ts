import admin from "firebase-admin";
import serviceAccount from "../../creadential/serviceAccountKey.json";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;
