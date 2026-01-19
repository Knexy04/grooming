"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
exports.CONFIG = {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin12345',
    frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
};
//# sourceMappingURL=config.js.map