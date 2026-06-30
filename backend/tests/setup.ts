/**
 * Test environment setup
 * يُحمَّل قبل كل test suite لضمان وجود المتغيرات الضرورية
 */

// JWT secrets (32+ chars مطلوبة بالـ env schema)
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-32-chars!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars!';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

// Database + Redis (مش بنتصل فعلياً في unit tests)
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';

// App config
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.FRONTEND_URL = 'http://localhost:3000';
