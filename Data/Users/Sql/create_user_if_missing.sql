INSERT INTO users (email, name, identity_id)
VALUES ($1, $2, $3)
ON CONFLICT (identity_id) DO NOTHING;
