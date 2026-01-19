export const CONFIG = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin12345',
  // QR будет вести на фронт
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
};


