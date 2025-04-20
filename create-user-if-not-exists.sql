-- Check if the user exists in the users table
-- Replace 'your-user-id' with the actual user ID from the authentication
DO $$
DECLARE
    user_id_var TEXT := 'your-user-id'; -- Replace with actual user ID
    user_email_var TEXT := 'your-email@example.com'; -- Replace with actual email
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM users WHERE id = user_id_var) INTO user_exists;
    
    -- If user doesn't exist, create it
    IF NOT user_exists THEN
        INSERT INTO users (id, email, created_at, updated_at)
        VALUES (user_id_var, user_email_var, NOW(), NOW());
        RAISE NOTICE 'User created: %', user_id_var;
    ELSE
        RAISE NOTICE 'User already exists: %', user_id_var;
    END IF;
END $$;

-- Verify the user exists
SELECT id, email, created_at FROM users WHERE id = 'your-user-id'; -- Replace with actual user ID
