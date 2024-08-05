import 'dotenv/config';
import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from './FirebaseService.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    databaseURL: process.env.DATABASE_URL,
});

export const database = admin.database();
