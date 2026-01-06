-- Database Backup Script
-- This creates a complete backup of critical tables before migration
-- Run this first: psql -U postgres -d animalytics -f migrations/manual/backup_database.sql

BEGIN;

-- Create backup schema if not exists
CREATE SCHEMA IF NOT EXISTS backup_pre_migration;

-- Backup buyer_profiles table
DROP TABLE IF EXISTS backup_pre_migration.buyer_profiles_backup CASCADE;
CREATE TABLE backup_pre_migration.buyer_profiles_backup AS 
SELECT * FROM buyer_profiles;

-- Backup conversations table
DROP TABLE IF EXISTS backup_pre_migration.conversations_backup CASCADE;
CREATE TABLE backup_pre_migration.conversations_backup AS 
SELECT * FROM conversations;

-- Backup purchases table
DROP TABLE IF EXISTS backup_pre_migration.purchases_backup CASCADE;
CREATE TABLE backup_pre_migration.purchases_backup AS 
SELECT * FROM purchases;

-- Backup purchase_timeline table
DROP TABLE IF EXISTS backup_pre_migration.purchase_timeline_backup CASCADE;
CREATE TABLE backup_pre_migration.purchase_timeline_backup AS 
SELECT * FROM purchase_timeline;

-- Backup wallet_transactions table
DROP TABLE IF EXISTS backup_pre_migration.wallet_transactions_backup CASCADE;
CREATE TABLE backup_pre_migration.wallet_transactions_backup AS 
SELECT * FROM wallet_transactions;

-- Backup users table
DROP TABLE IF EXISTS backup_pre_migration.users_backup CASCADE;
CREATE TABLE backup_pre_migration.users_backup AS 
SELECT * FROM users;

COMMIT;

-- Verification
SELECT 'Backup complete! Tables backed up:' as status;
SELECT 
  schemaname, 
  tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'backup_pre_migration'
ORDER BY tablename;

-- Show record counts
SELECT 'Record counts in backup:' as status;
SELECT 'buyer_profiles' as table_name, COUNT(*) as records FROM backup_pre_migration.buyer_profiles_backup
UNION ALL
SELECT 'conversations', COUNT(*) FROM backup_pre_migration.conversations_backup
UNION ALL
SELECT 'purchases', COUNT(*) FROM backup_pre_migration.purchases_backup
UNION ALL
SELECT 'purchase_timeline', COUNT(*) FROM backup_pre_migration.purchase_timeline_backup
UNION ALL
SELECT 'wallet_transactions', COUNT(*) FROM backup_pre_migration.wallet_transactions_backup
UNION ALL
SELECT 'users', COUNT(*) FROM backup_pre_migration.users_backup;
