-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Catálogo de Minijuegos
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,            -- Ej: 'INTERESES', 'APTITUD_LOGICA', 'RIASEC'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Preguntas / Escenarios del Minijuego
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL,
    text TEXT NOT NULL,                        -- Pregunta o escenario del juego
    type VARCHAR(50) NOT NULL,                 -- Ej: 'MULTIPLE_CHOICE', 'RANKING'
    options JSONB NOT NULL,                    -- Opciones de respuesta y sus pesos RIASEC
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_question_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- 3. Sesiones de Juego (Intentos de los estudiantes)
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,                    -- ID del estudiante (clave foránea lógica hacia Auth Service)
    game_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS', -- Ej: 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE NULL,
    
    CONSTRAINT fk_session_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- 4. Respuestas del Estudiante (Asociadas a la sesión de juego)
CREATE TABLE IF NOT EXISTS student_answers (
    session_id UUID NOT NULL,
    question_id UUID NOT NULL,
    selected_option_id VARCHAR(50) NOT NULL,  -- ID de la opción elegida
    raw_data JSONB NULL,                       -- Información extra si aplica (ej: tiempo de respuesta)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (session_id, question_id),
    CONSTRAINT fk_answer_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 5. Resultados del Juego (Puntajes RIASEC consolidados al terminar)
CREATE TABLE IF NOT EXISTS game_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE NOT NULL,
    user_id UUID NOT NULL,                    -- ID del estudiante (clave foránea lógica hacia Auth Service)
    game_id UUID NOT NULL,
    scores JSONB NOT NULL,                     -- Resumen final: ej: {"R": 0.8, "I": 0.2, ...}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_result_session FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_result_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- 6. Índices para optimizar consultas de rendimiento
CREATE INDEX IF NOT EXISTS idx_sessions_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_results_user ON game_results(user_id);

-- 7. Trigger para actualización automática de fechas (updated_at)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER trigger_update_results_updated_at
    BEFORE UPDATE ON game_results
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();


-- =====================================================================
-- DATOS SEMILLA (SEEDS) - Minijuego de Prueba RIASEC
-- =====================================================================

-- Insertar juego base
INSERT INTO games (id, title, description, category, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Simulador de Roles Profesionales', 'Enfréntate a decisiones reales del día a día de diversas profesiones y descubre tus intereses predominantes.', 'RIASEC', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Insertar Pregunta 1 (Enfoque: Tecnología y Diseño)
INSERT INTO questions (id, game_id, text, type, options) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tu equipo escolar quiere crear un sitio web. ¿Qué rol prefieres tomar?', 'MULTIPLE_CHOICE', 
'[
  {"id": "opt1_1", "text": "Programar la lógica del sitio y configurar la base de datos.", "weights": {"R": 1.0, "I": 0.8}},
  {"id": "opt1_2", "text": "Diseñar la interfaz de usuario, los colores y las ilustraciones.", "weights": {"A": 1.0}},
  {"id": "opt1_3", "text": "Organizar las tareas del equipo y presentarlo ante la clase.", "weights": {"E": 1.0, "S": 0.5}},
  {"id": "opt1_4", "text": "Redactar el contenido y asegurar que todo tenga una ortografía y formato impecable.", "weights": {"C": 1.0}}
]')
ON CONFLICT (id) DO NOTHING;

-- Insertar Pregunta 2 (Enfoque: Investigación y Ayuda)
INSERT INTO questions (id, game_id, text, type, options) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Estás en una feria de ciencias y tienes presupuesto para financiar un proyecto. ¿Cuál eliges?', 'MULTIPLE_CHOICE', 
'[
  {"id": "opt2_1", "text": "Una investigación de laboratorio para buscar la cura de una enfermedad común.", "weights": {"I": 1.0, "R": 0.5}},
  {"id": "opt2_2", "text": "Una campaña comunitaria de salud mental y apoyo emocional para jóvenes.", "weights": {"S": 1.0, "A": 0.5}},
  {"id": "opt2_3", "text": "Un dispositivo mecánico robotizado que automatiza la cosecha de cultivos.", "weights": {"R": 1.0, "C": 0.5}},
  {"id": "opt2_4", "text": "Un modelo de negocios innovador para vender productos locales de forma eficiente.", "weights": {"E": 1.0}}
]')
ON CONFLICT (id) DO NOTHING;
