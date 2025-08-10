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
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@competezone.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 'Admin Test', 'Administrador del sistema', 'Madrid, España', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'athlete@competezone.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ATHLETE', 'Athlete Test', 'Atleta de CrossFit apasionado', 'Barcelona, España', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'gym@competezone.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'GYM', 'Gym Owner Test', 'Propietario de gimnasio', 'Valencia, España', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'athlete2@competezone.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ATHLETE', 'María García', 'Atleta principiante', 'Sevilla, España', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'gym2@competezone.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'GYM', 'Carlos López', 'Entrenador certificado', 'Bilbao, España', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  updated_at = NOW();

-- Insertar gimnasios de prueba
INSERT INTO gyms (id, name, description, location_text, contact_phone, owner_user_id, created_at, updated_at)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', 'CrossFit Madrid', 'Gimnasio especializado en CrossFit con equipamiento de alta calidad', 'Calle Gran Vía 123, Madrid', '+34 91 123 4567', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440002', 'PowerGym Barcelona', 'Centro de entrenamiento funcional y fuerza', 'Avenida Diagonal 456, Barcelona', '+34 93 987 6543', '550e8400-e29b-41d4-a716-446655440005', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440003', 'Fitness Valencia', 'Gimnasio moderno con clases de CrossFit y entrenamiento personal', 'Carrer de Colón 789, Valencia', '+34 96 555 1234', '550e8400-e29b-41d4-a716-446655440003', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  location_text = EXCLUDED.location_text,
  contact_phone = EXCLUDED.contact_phone,
  owner_user_id = EXCLUDED.owner_user_id,
  updated_at = NOW();

-- Insertar eventos de prueba
INSERT INTO events (id, title, description, date, "time", location_text, max_participants, registration_deadline, gym_id, created_at, updated_at)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', 'CrossFit Competition Madrid 2025', 'Competición anual de CrossFit en Madrid con premios para los ganadores', '2025-06-15', '09:00:00', 'CrossFit Madrid, Calle Gran Vía 123', 50, '2025-06-10', '660e8400-e29b-41d4-a716-446655440001', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440002', 'Functional Training Challenge', 'Desafío de entrenamiento funcional para todos los niveles', '2025-07-20', '10:00:00', 'PowerGym Barcelona, Avenida Diagonal 456', 30, '2025-07-15', '660e8400-e29b-41d4-a716-446655440002', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440003', 'Valencia Fitness Open', 'Competición abierta de fitness en Valencia', '2025-08-10', '08:30:00', 'Fitness Valencia, Carrer de Colón 789', 40, '2025-08-05', '660e8400-e29b-41d4-a716-446655440003', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440004', 'Beginner CrossFit Workshop', 'Taller para principiantes de CrossFit', '2025-05-25', '14:00:00', 'CrossFit Madrid, Calle Gran Vía 123', 20, '2025-05-20', '660e8400-e29b-41d4-a716-446655440001', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  date = EXCLUDED.date,
  "time" = EXCLUDED."time",
  location_text = EXCLUDED.location_text,
  max_participants = EXCLUDED.max_participants,
  registration_deadline = EXCLUDED.registration_deadline,
  gym_id = EXCLUDED.gym_id,
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
