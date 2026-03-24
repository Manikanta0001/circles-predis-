import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '../../.env') });

async function testDatabaseConnection() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'amealio_db',
  });

  try {
    console.log('🔍 Testing database connection...');
    console.log('📋 Connection Details:');
    const options = dataSource.options as any;
    console.log(`   Host: ${options.host || 'N/A'}`);
    console.log(`   Port: ${options.port || 'N/A'}`);
    console.log(`   Database: ${options.database || 'N/A'}`);
    console.log(`   Username: ${options.username || 'N/A'}`);
    console.log('');

    await dataSource.initialize();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await dataSource.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result[0].version);
    
    // Check if database exists
    const dbName = (dataSource.options as any).database;
    const dbCheck = await dataSource.query(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [dbName]
    );
    
    if (dbCheck.length > 0) {
      console.log(`✅ Database "${dbName}" exists`);
    } else {
      console.log(`⚠️  Database "${dbName}" does not exist`);
    }

    await dataSource.destroy();
    console.log('🔌 Connection closed');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible issues:');
      console.error('   1. PostgreSQL server is not running');
      console.error('   2. Wrong host or port in .env file');
      console.error('   3. Firewall blocking the connection');
    } else if (error.code === '28P01') {
      console.error('\n💡 Possible issues:');
      console.error('   1. Wrong username or password in .env file');
    } else if (error.code === '3D000') {
      console.error('\n💡 Possible issues:');
      const dbName = (dataSource.options as any).database;
      console.error(`   1. Database "${dbName}" does not exist`);
      console.error(`   2. Create it using: CREATE DATABASE ${dbName};`);
    }
    
    process.exit(1);
  }
}

testDatabaseConnection();

