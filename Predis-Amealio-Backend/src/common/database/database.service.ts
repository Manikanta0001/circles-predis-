import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
        this.logger.log('✅ Database connection established');
        
        // Test the connection with a simple query
        await this.dataSource.query('SELECT 1');
        this.logger.log('✅ Database connection verified');
        
        // Log database info
        const dbInfo = await this.dataSource.query(
          "SELECT current_database(), version()"
        );
        this.logger.log(`📊 Connected to database: ${dbInfo[0].current_database}`);
      } else {
        this.logger.log('✅ Database already initialized');
      }
    } catch (error: any) {
      this.logger.error('❌ Database connection failed!');
      this.logger.error(`Error: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        this.logger.error('💡 PostgreSQL server is not running or wrong host/port');
      } else if (error.code === '28P01') {
        this.logger.error('💡 Wrong username or password');
      } else if (error.code === '3D000') {
        this.logger.error('💡 Database does not exist. Create it first.');
      }
      
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.logger.log('🔌 Database connection closed');
    }
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  async isConnected(): Promise<boolean> {
    try {
      if (!this.dataSource.isInitialized) {
        return false;
      }
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
