INSERT INTO roles (name)
VALUES ('admin'), ('validator'), ('user')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tags (name)
VALUES ('paisaje'), ('retrato'), ('urbano'), ('naturaleza'), ('viajes')
ON CONFLICT (name) DO NOTHING;
