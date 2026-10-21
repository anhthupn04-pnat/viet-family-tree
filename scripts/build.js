const { execSync } = require('child_process');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

console.log('--- BUILD STARTING with DATABASE_URL =', process.env.DATABASE_URL, '---');

try {
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });
  execSync('node prisma/seed.js', { stdio: 'inherit', env: process.env });
  
  // Đảm bảo dev.db có mặt ở cả thư mục gốc và thư mục prisma để Vercel serverless bundle
  const fs = require('fs');
  const path = require('path');
  const rootDb = path.join(process.cwd(), 'dev.db');
  const prismaDb = path.join(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(prismaDb) && !fs.existsSync(rootDb)) {
    fs.copyFileSync(prismaDb, rootDb);
  } else if (fs.existsSync(rootDb) && !fs.existsSync(prismaDb)) {
    fs.copyFileSync(rootDb, prismaDb);
  }

  execSync('npx next build', { stdio: 'inherit', env: process.env });
  console.log('--- BUILD FINISHED SUCCESSFULLY ---');
} catch (error) {
  console.error('Build step failed:', error);
  process.exit(1);
}
