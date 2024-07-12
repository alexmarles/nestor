const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('../../FirebaseService.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: functions.config().telegram.token,
});

module.exports = {
    database: admin.database(),
};
