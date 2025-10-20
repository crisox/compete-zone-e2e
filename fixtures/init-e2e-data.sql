-- =============================================================================
-- Datos de prueba para CompeteZone E2E
-- =============================================================================

-- Limpiar datos existentes (opcional)
-- DELETE FROM event_registrations;
-- DELETE FROM gym_reviews;
-- DELETE FROM media;
-- DELETE FROM events;
-- DELETE FROM gyms;
-- DELETE FROM users;
-- DELETE FROM refresh_tokens;

-- Insertar usuarios de prueba
INSERT INTO users (id, email, password_hash, role, name, bio, location, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@dev.com', '$2a$10$13gsVSmBDYlL7HN325G0VuUw4tHacRShGcmX4idwCCR5LQsQ8db0.', 'ADMIN', 'Admin Test', 'Administrador del sistema', 'Madrid, España', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'atleta@dev.com', '$2a$10$13gsVSmBDYlL7HN325G0VuUw4tHacRShGcmX4idwCCR5LQsQ8db0.', 'ATHLETE', 'Athlete Test', 'Atleta de CrossFit apasionado', 'Barcelona, España', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'gimnasio@dev.com', '$2a$10$13gsVSmBDYlL7HN325G0VuUw4tHacRShGcmX4idwCCR5LQsQ8db0.', 'GYM', 'Gym Owner Test', 'Propietario de gimnasio', 'Valencia, España', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'athlete2@competezone.test', '$2a$10$13gsVSmBDYlL7HN325G0VuUw4tHacRShGcmX4idwCCR5LQsQ8db0.', 'ATHLETE', 'María García', 'Atleta principiante', 'Sevilla, España', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'gym2@competezone.test', '$2a$10$13gsVSmBDYlL7HN325G0VuUw4tHacRShGcmX4idwCCR5LQsQ8db0.', 'GYM', 'Carlos López', 'Entrenador certificado', 'Bilbao, España', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  updated_at = NOW();

-- Insertar gimnasios de prueba (actualizar usuarios con rol GYM)
UPDATE users SET
  name = 'CrossFit Madrid',
  bio = 'Gimnasio especializado en CrossFit con equipamiento de alta calidad',
  location = 'Calle Gran Vía 123, Madrid',
  updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440003' AND role = 'GYM';

UPDATE users SET
  name = 'PowerGym Barcelona',
  bio = 'Centro de entrenamiento funcional y fuerza',
  location = 'Avenida Diagonal 456, Barcelona',
  updated_at = NOW()
WHERE id = '550e8400-e29b-41d4-a716-446655440005' AND role = 'GYM';

-- Insertar eventos de prueba
INSERT INTO events (id, organizer_user_id, title, description, date, "time", location_text, fee, max_participants, registration_deadline, created_at, updated_at)
VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'CrossFit Competition Madrid 2025', 'Competición anual de CrossFit en Madrid con premios para los ganadores', '2025-06-15', '09:00:00', 'CrossFit Madrid, Calle Gran Vía 123', 25.00, 50, '2025-06-10', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'Functional Training Challenge', 'Desafío de entrenamiento funcional para todos los niveles', '2025-07-20', '10:00:00', 'PowerGym Barcelona, Avenida Diagonal 456', 15.00, 30, '2025-07-15', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Valencia Fitness Open', 'Competición abierta de fitness en Valencia', '2025-08-10', '08:30:00', 'Fitness Valencia, Carrer de Colón 789', 30.00, 40, '2025-08-05', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Beginner CrossFit Workshop', 'Taller para principiantes de CrossFit', '2025-05-25', '14:00:00', 'CrossFit Madrid, Calle Gran Vía 123', 10.00, 20, '2025-05-20', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  organizer_user_id = EXCLUDED.organizer_user_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  date = EXCLUDED.date,
  "time" = EXCLUDED."time",
  location_text = EXCLUDED.location_text,
  max_participants = EXCLUDED.max_participants,
  registration_deadline = EXCLUDED.registration_deadline,
  updated_at = NOW();

-- Insertar algunas inscripciones de prueba (comentado temporalmente para evitar problemas con fechas)
-- INSERT INTO event_registrations (id, event_id, athlete_user_id, status, registered_at)
-- VALUES 
--   ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'CONFIRMED', NOW()),
--   ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'PENDING', NOW()),
--   ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'CONFIRMED', NOW())
-- ON CONFLICT (id) DO UPDATE SET
--   event_id = EXCLUDED.event_id,
--   athlete_user_id = EXCLUDED.athlete_user_id,
--   status = EXCLUDED.status,
--   registered_at = NOW();

COMMIT;
