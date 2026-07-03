"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = verifyFirebaseToken;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const config_1 = require("../../config");
let initializedApp = null;
function getFirebaseApp() {
    if (!config_1.env.ENABLE_FIREBASE_VERIFY) {
        throw new Error('Firebase verification disabled');
    }
    if (initializedApp) {
        return initializedApp;
    }
    if (!config_1.env.GCP_SA_KEY) {
        throw new Error('GCP_SA_KEY is required when ENABLE_FIREBASE_VERIFY=true');
    }
    if ((0, app_1.getApps)().length > 0) {
        initializedApp = (0, app_1.getApps)()[0];
        return initializedApp;
    }
    initializedApp = (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(JSON.parse(config_1.env.GCP_SA_KEY)),
    });
    return initializedApp;
}
async function verifyFirebaseToken(token) {
    const app = getFirebaseApp();
    const decodedToken = await (0, auth_1.getAuth)(app).verifyIdToken(token);
    return decodedToken.uid;
}
