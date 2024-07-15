require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require('./FirebaseService.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL,
});

module.exports = {
    database: admin.database(),
};
