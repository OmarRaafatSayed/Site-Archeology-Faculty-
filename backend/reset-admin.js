/**
 * reset-admin.js — يعيد ضبط كلمة مرور الأدمن
 * Run from project root: npm run reset-admin
 * Or from backend folder: node reset-admin.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const EMAIL    = 'admin@fa-arch.cu.edu.eg';
const PASSWORD = 'Admin@12345';

async function main() {
  const p = new PrismaClient();
  try {
    const hash = await bcrypt.hash(PASSWORD, 12);
    const user = await p.user.upsert({
      where:  { email: EMAIL },
      update: { passwordHash: hash, isActive: true },
      create: {
        email:        EMAIL,
        username:     'admin',
        passwordHash: hash,
        role:         'admin',
        isActive:     true,
      },
    });
    console.log('');
    console.log('✅ Admin credentials reset successfully!');
    console.log(`   Email:    ${user.email}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log('');
  } finally {
    await p.$disconnect();
  }
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
