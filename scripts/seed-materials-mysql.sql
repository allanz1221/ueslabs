-- Insert sample materials for MySQL
INSERT INTO Material (id, name, description, category, totalQuantity, availableQuantity, location, imageUrl, createdAt, updatedAt) VALUES
('mat_001', 'Microscopio Óptico', 'Microscopio óptico binocular con aumento 40x-1000x', 'Microscopía', 10, 10, 'Laboratorio A - Estante 1', NULL, NOW(), NOW()),
('mat_002', 'Balanza Analítica', 'Balanza de precisión 0.0001g', 'Medición', 5, 5, 'Laboratorio B - Mesa 3', NULL, NOW(), NOW()),
('mat_003', 'Pipeta Automática 10-100µL', 'Pipeta de volumen variable', 'Volumetría', 15, 15, 'Laboratorio A - Cajón 2', NULL, NOW(), NOW()),
('mat_004', 'Centrífuga', 'Centrífuga de mesa 4000 rpm', 'Equipos', 3, 3, 'Laboratorio C - Mesa Central', NULL, NOW(), NOW()),
('mat_005', 'pH-metro Digital', 'Medidor de pH con calibración automática', 'Medición', 8, 8, 'Laboratorio B - Estante 2', NULL, NOW(), NOW()),
('mat_006', 'Agitador Magnético', 'Agitador con calentamiento hasta 300°C', 'Equipos', 12, 12, 'Laboratorio A - Mesa 4', NULL, NOW(), NOW()),
('mat_007', 'Espectrofotómetro UV-Vis', 'Rango 190-1100nm', 'Análisis', 2, 2, 'Laboratorio C - Mesa de Instrumentos', NULL, NOW(), NOW()),
('mat_008', 'Autoclave', 'Esterilizador de vapor 20L', 'Esterilización', 2, 2, 'Laboratorio B - Área de Esterilización', NULL, NOW(), NOW()),
('mat_009', 'Termómetro Digital', 'Rango -50°C a 300°C', 'Medición', 20, 20, 'Laboratorio A - Cajón 1', NULL, NOW(), NOW()),
('mat_010', 'Probeta Graduada 100mL', 'Vidrio borosilicato clase A', 'Volumetría', 30, 30, 'Laboratorio A - Estante 3', NULL, NOW(), NOW());
