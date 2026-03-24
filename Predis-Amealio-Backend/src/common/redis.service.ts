// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import Redis from 'ioredis';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class RedisService implements OnModuleInit, OnModuleDestroy {
//   private client: Redis | null = null;
//   private isEnabled: boolean;

//   constructor(private configService: ConfigService) {
//     this.isEnabled = this.configService.get('REDIS_ENABLED') !== 'false';
    
//     if (this.isEnabled) {
//       try {
//         this.client = new Redis({
//           host: this.configService.get('REDIS_HOST') || 'localhost',
//           port: this.configService.get('REDIS_PORT') || 6379,
//           retryStrategy: (times) => {
//             const delay = Math.min(times * 50, 2000);
//             return delay;
//           },
//         });
//       } catch (error) {
//         console.warn('⚠️ Failed to initialize Redis:', error.message);
//         this.isEnabled = false;
//       }
//     } else {
//       console.log('ℹ️ Redis is disabled by configuration');
//     }
//   }

//   async onModuleInit() {
//     if (!this.client) return;
    
//     this.client.on('connect', () => {
//       console.log('✅ Redis connected');
//     });

//     this.client.on('error', (err) => {
//       console.error('❌ Redis error:', err);
//     });
//   }

//   async onModuleDestroy() {
//     if (this.client) {
//       await this.client.quit();
//     }
//   }

//   async get(key: string): Promise<string | null> {
//     if (!this.client) return null;
//     try {
//       return await this.client.get(key);
//     } catch (error) {
//       console.error('Redis get error:', error);
//       return null;
//     }
//   }

//   async set(key: string, value: string, ttl?: number): Promise<void> {
//     if (!this.client) return;
//     try {
//       if (ttl) {
//         await this.client.set(key, value, 'EX', ttl);
//       } else {
//         await this.client.set(key, value);
//       }
//     } catch (error) {
//       console.error('Redis set error:', error);
//     }
//   }

//   async del(key: string): Promise<number> {
//     if (!this.client) return 0;
//     try {
//       return await this.client.del(key);
//     } catch (error) {
//       console.error('Redis del error:', error);
//       return 0;
//     }
//   }

//   async exists(key: string): Promise<boolean> {
//     const result = await this.client.exists(key);
//     return result === 1;
//   }
// }


import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  private isEnabled = false;

  constructor() {
    console.log('ℹ️ Using Mock Redis Service - Redis is disabled');
  }

  async onModuleInit() {
    // No-op
  }

  async onModuleDestroy() {
    // No-op
  }

  async get(key: string): Promise<string | null> {
    return null;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    // No-op
  }

  async del(key: string): Promise<number> {
    return 0;
  }

  async exists(key: string): Promise<boolean> {
    return false;
  }
}