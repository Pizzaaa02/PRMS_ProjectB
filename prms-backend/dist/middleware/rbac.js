"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrAgent = exports.adminOrLandlord = exports.agentOnly = exports.tenantOnly = exports.landlordOnly = exports.adminOnly = void 0;
exports.authorize = authorize;
function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: { message: 'Authentication required' } });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: { message: `Insufficient permissions. Required role: ${allowedRoles.join(', ')}` },
            });
        }
        next();
    };
}
exports.adminOnly = authorize('Admin');
exports.landlordOnly = authorize('Landlord');
exports.tenantOnly = authorize('Tenant');
exports.agentOnly = authorize('Agent');
exports.adminOrLandlord = authorize('Admin', 'Landlord');
exports.adminOrAgent = authorize('Admin', 'Agent');
