// データベース設定のサンプル

// データベース接続設定
const host     = 'localhost';
const port     = 5432;
const database = 'myapp';
const username = 'dbuser';
const password = 'secretpassword';

// 接続プール設定
const minConnections    = 5;
const maxConnections    = 20;
const connectionTimeout = 30000;

// ログ設定
const enableLogging = true;
const logLevel      = 'debug';

// バックアップ設定
export const backupEnabled = true;
export const backupSchedule = '0 2 * * *';
export const backupRetentionDays = 30;

// パフォーマンス設定
let cacheEnabled = true;
let cacheSize    = 1000;
let queryTimeout = 5000;

// 開発環境の設定
if (process.env.NODE_ENV === 'development') {
  const devHost     = 'localhost';
  const devPort     = 5433;
  const devDatabase = 'myapp_dev';
} 