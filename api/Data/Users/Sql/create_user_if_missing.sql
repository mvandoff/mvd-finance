INSERT INTO users (email, name, identity_id)
VALUES (@Email, @Name, @IdentityId)
ON CONFLICT (identity_id) DO NOTHING;
