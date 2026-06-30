import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Redis } from 'ioredis';

async function main() {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  await redis.flushall();
  console.log('✅ Redis cache flushed');
  await redis.quit();
}

main().catch((e) => { console.error(e); process.exit(1); });
