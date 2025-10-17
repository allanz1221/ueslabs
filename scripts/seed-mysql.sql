-- Script para poblar la base de datos MySQL con datos iniciales
-- Este script es compatible con MySQL (no PostgreSQL)

-- Insertar materiales de ejemplo
INSERT INTO Material (id, name, description, category, totalQuantity, availableQuantity, location, imageUrl, createdAt, updatedAt) VALUES
('mat_001', 'Microscopio Óptico', 'Microscopio óptico binocular con aumento 40x-1000x', 'Microscopía', 10, 10, 'Laboratorio A - Estante 1', NULL, NOW(), NOW()),
('mat_002', 'Balanza Analítica', 'Balanza de precisión 0.0001g', 'Medición', 5, 5, 'Laboratorio B - Mesa 3', NULL, NOW(), NOW()),
('mat_003', 'Pipeta Automática 10-100µL', 'Pipeta de volumen variable', 'Volumetría', 15, 15, 'Laboratorio A - Cajón 2', NULL, NOW(), NOW()),
('mat_004', 'Centrífuga', 'Centrífuga de mesa 4000 rpm', 'Equipos', 3, 3, 'Laboratorio C - Mesa Central', NULL, NOW(), NOW()),
('mat_005', 'pH-metro Digital', 'Medidor de pH con calibración automática', 'Medición', 8, 8, 'Laboratorio B - Estante 2', NULL, NOW(), NOW());

-- Insertar salas de ejemplo
INSERT INTO Room (id, name, capacity, type, location, program, responsibleId, createdAt) VALUES
('room_001', 'Laboratorio de Mecatrónica A', 20, 'LABORATORIO', 'Edificio Principal - Piso 2', 'MECATRONICA', NULL, NOW()),
('room_002', 'Laboratorio de Manufactura B', 25, 'LABORATORIO', 'Edificio Principal - Piso 3', 'MANUFACTURA', NULL, NOW()),
('room_003', 'Aula de Teoría 1', 30, 'AULA', 'Edificio Principal - Piso 1', NULL, NULL, NOW()),
('room_004', 'Taller de Prácticas', 15, 'TALLER', 'Edificio Secundario - Piso 1', NULL, NULL, NOW());

-- Insertar materias de ejemplo
INSERT INTO Subject (id, name, program, semester, createdAt) VALUES
('sub_001', 'Fundamentos de Mecatrónica', 'MECATRONICA', 1, NOW()),
('sub_002', 'Sistemas de Control', 'MECATRONICA', 3, NOW()),
('sub_003', 'Procesos de Manufactura', 'MANUFACTURA', 2, NOW()),
('sub_004', 'Control de Calidad', 'MANUFACTURA', 4, NOW());

-- Crear usuario administrador (necesitarás hashear la contraseña)
-- INSERT INTO User (id, name, email, role, program, password, createdAt, updatedAt) VALUES
-- ('admin_001', 'Administrador del Sistema', 'admin@laboratorio.edu', 'ADMIN', NULL, '$2a$10$hashedpassword', NOW(), NOW());
