import 'dotenv/config';
import admin, { ServiceAccount } from 'firebase-admin';
import realtimeServiceAccount from './FirebaseService.json';
import webpageServiceAccount from './WebpageService.json';

const defaultApp =
    admin.apps.find((app) => app?.name === '[DEFAULT]') ??
    admin.initializeApp({
        credential: admin.credential.cert(
            realtimeServiceAccount as ServiceAccount
        ),
        databaseURL: process.env.DATABASE_URL,
    });

const webpageApp =
    admin.apps.find((app) => app?.name === 'webpage') ??
    admin.initializeApp(
        {
            credential: admin.credential.cert(
                webpageServiceAccount as ServiceAccount
            ),
        },
        'webpage'
    );

export const database = defaultApp.database();
export const firestore = webpageApp.firestore();
