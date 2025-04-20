-- Check if the users table exists and has the correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Check if there are any constraints on the users table
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass;

-- Check if there are any existing users in the users table
SELECT COUNT(*) FROM users;
