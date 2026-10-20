const { execSync } = require('child_process');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

console.log('--- BUILD STARTING with DATABASE_URL =', process.env.DATABASE_URL, '---');

try {
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });
  execSync('node prisma/seed.js', { stdio: 'inherit', env: process.env });
  execSync('npx next build', { stdio: 'inherit', env: process.env });
  console.log('--- BUILD FINISHED SUCCESSFULLY ---');
} catch (error) {
  console.error('Build step failed:', error);
  process.exit(1);
}
