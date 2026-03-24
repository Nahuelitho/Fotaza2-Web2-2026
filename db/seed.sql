INSERT INTO roles (name)
VALUES ('admin'), ('validator'), ('user')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (role_id, username, email, password_hash, display_name, bio)
SELECT r.id, 'admin', 'admin@fotaza.local', '$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqrstuv', 'Admin Fotaza', 'Usuario administrador de ejemplo.'
FROM roles r
WHERE r.name = 'admin'
  AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (role_id, username, email, password_hash, display_name, bio)
SELECT r.id, 'validator', 'validator@fotaza.local', '$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqrstuv', 'Validador Fotaza', 'Usuario validador de ejemplo.'
FROM roles r
WHERE r.name = 'validator'
  AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'validator');

INSERT INTO users (role_id, username, email, password_hash, display_name, bio)
SELECT r.id, 'demo', 'demo@fotaza.local', '$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqrstuv', 'Usuario Demo', 'Usuario comun para pruebas iniciales.'
FROM roles r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo');

INSERT INTO tags (name)
VALUES
  ('paisaje'),
  ('retrato'),
  ('urbano'),
  ('naturaleza'),
  ('viajes')
ON DUPLICATE KEY UPDATE name = VALUES(name);
