import 'dotenv/config';
import admin, { ServiceAccount } from 'firebase-admin';
import serviceAccount from './WebpageService.json';

const app = admin.initializeApp(
    {
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
    },
    process.env.WEBPAGE_DB_NAME as string
);

export const firestore = app.firestore();
