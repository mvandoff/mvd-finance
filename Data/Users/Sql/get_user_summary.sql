SELECT name, email
FROM users
WHERE identity_id = $1;