-- Check if the workouts table has the correct structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workouts';

-- Check if there are any constraints that might be causing conflicts
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'workouts'::regclass;

-- Check if there are any triggers on the workouts table
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'workouts';

-- Let's also check if there are any existing rows in the workouts table
SELECT COUNT(*) FROM workouts;
