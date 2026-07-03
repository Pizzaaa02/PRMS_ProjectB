"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const config_1 = require("./config");
const db_1 = require("./db");
const logging_1 = require("./middleware/logging");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_auth_1 = __importDefault(require("./modules/auth/routes_auth"));
const routes_user_1 = __importDefault(require("./modules/user/routes_user"));
const routes_property_1 = __importDefault(require("./modules/property/routes_property"));
const routes_search_1 = __importDefault(require("./modules/search/routes_search"));
const routes_booking_1 = __importDefault(require("./modules/booking/routes_booking"));
const routes_payment_1 = __importDefault(require("./modules/payment/routes_payment"));
const routes_maintenance_1 = __importDefault(require("./modules/maintenance/routes_maintenance"));
const routes_communication_1 = __importDefault(require("./modules/communication/routes_communication"));
const routes_admin_1 = __importDefault(require("./modules/admin/routes_admin"));
const routes_reporting_1 = __importDefault(require("./modules/reporting/routes_reporting"));
const routes_agent_1 = __importDefault(require("./modules/agent/routes_agent"));
// Initialize Firebase if possible
if ((0, app_1.getApps)().length === 0) {
    try {
        (0, app_1.initializeApp)({
            credential: config_1.env.GCP_SA_KEY ? JSON.parse(config_1.env.GCP_SA_KEY) : { projectId: 'prms-local' },
        });
    }
    catch {
        console.log('[Firebase] Running without credential (local mode)');
    }
}
const app = (0, express_1.default)();
const router = express_1.default.Router();
const PORT = config_1.env.PORT;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: config_1.env.CORS_ORIGIN }));
app.use(express_1.default.json());
app.use(logging_1.requestLogger);
app.get('/health', async (req, res) => {
    try {
        await db_1.prisma.$queryRaw `SELECT 1`;
        res.status(200).json({ health: 'ok', timestamp: new Date().toISOString(), environment: config_1.env.NODE_ENV, db: 'connected' });
    }
    catch (err) {
        res.status(503).json({ health: 'degraded', timestamp: new Date().toISOString(), db: 'unreachable', error: err.message });
    }
});
app.get('/', (req, res) => {
    res.json({ app: 'PRMS Backend', version: '1.0.0', status: 'running', documentation: '/health' });
});
router.post('/auth/verify', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token)
            return res.status(401).json({ error: 'Missing Firebase token' });
        const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(token);
        res.json({ userId: decodedToken.uid, email: decodedToken.email, name: decodedToken.name });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid Firebase token' });
    }
});
router.use('/auth', routes_auth_1.default);
router.use('/users', routes_user_1.default);
router.use('/properties', routes_property_1.default);
router.use('/search', routes_search_1.default);
router.use('/bookings', routes_booking_1.default);
router.use('/payments', routes_payment_1.default);
router.use('/maintenance', routes_maintenance_1.default);
router.use('/communication', routes_communication_1.default);
router.use('/admin', routes_admin_1.default);
router.use('/reports', routes_reporting_1.default);
router.use('/agents', routes_agent_1.default);
app.use(router);
app.use(errorHandler_1.errorHandler);
const server = app.listen(PORT, () => {
    console.log(`PRMS Backend running on http://localhost:${PORT} (${config_1.env.NODE_ENV})`);
});
exports.default = app;
