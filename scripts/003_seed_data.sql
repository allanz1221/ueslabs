-- Insert sample materials
insert into public.materials (name, description, category, total_quantity, available_quantity, location) values
  ('Microscopio Óptico', 'Microscopio óptico binocular con aumento 40x-1000x', 'Microscopía', 10, 10, 'Laboratorio A - Estante 1'),
  ('Balanza Analítica', 'Balanza de precisión 0.0001g', 'Medición', 5, 5, 'Laboratorio B - Mesa 3'),
  ('Pipeta Automática 10-100µL', 'Pipeta de volumen variable', 'Volumetría', 15, 15, 'Laboratorio A - Cajón 2'),
  ('Centrífuga', 'Centrífuga de mesa 4000 rpm', 'Equipos', 3, 3, 'Laboratorio C - Mesa Central'),
  ('pH-metro Digital', 'Medidor de pH con calibración automática', 'Medición', 8, 8, 'Laboratorio B - Estante 2'),
  ('Agitador Magnético', 'Agitador con calentamiento hasta 300°C', 'Equipos', 12, 12, 'Laboratorio A - Mesa 4'),
  ('Espectrofotómetro UV-Vis', 'Rango 190-1100nm', 'Análisis', 2, 2, 'Laboratorio C - Mesa de Instrumentos'),
  ('Autoclave', 'Esterilizador de vapor 20L', 'Esterilización', 2, 2, 'Laboratorio B - Área de Esterilización'),
  ('Termómetro Digital', 'Rango -50°C a 300°C', 'Medición', 20, 20, 'Laboratorio A - Cajón 1'),
  ('Probeta Graduada 100mL', 'Vidrio borosilicato clase A', 'Volumetría', 30, 30, 'Laboratorio A - Estante 3')
on conflict do nothing;
