-- ZUS na Plus - Chat Schema Migration
-- Dodanie tabel dla czatbota AI

-- Tabela sesji czatu
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Tworzenie indeksów dla chat_sessions
CREATE INDEX idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- Tabela wiadomości czatu
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'ai', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Tworzenie indeksów dla chat_messages
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);

-- Tabela kontekstu symulacji
CREATE TABLE simulation_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    simulation_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tworzenie indeksu dla simulation_context
CREATE INDEX idx_simulation_context_session_id ON simulation_context(session_id);

-- Wyłączenie RLS dla tabel czatu (publiczny dostęp)
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_context DISABLE ROW LEVEL SECURITY;

-- Uprawnienia dla roli anon (publiczny dostęp)
GRANT SELECT, INSERT ON chat_sessions TO anon;
GRANT SELECT, INSERT ON chat_messages TO anon;
GRANT SELECT, INSERT ON simulation_context TO anon;

-- Uprawnienia dla roli authenticated (pełny dostęp)
GRANT ALL PRIVILEGES ON chat_sessions TO authenticated;
GRANT ALL PRIVILEGES ON chat_messages TO authenticated;
GRANT ALL PRIVILEGES ON simulation_context TO authenticated;

-- Dane inicjalne - przykładowe szybkie pytania
INSERT INTO chat_sessions (session_id, is_active) VALUES ('quick_questions', false);

INSERT INTO chat_messages (session_id, message_type, content, metadata)
SELECT 
    (SELECT id FROM chat_sessions WHERE session_id = 'quick_questions'),
    'system',
    question,
    metadata::jsonb
FROM (VALUES 
    ('Jak działa system emerytalny w Polsce?', '{"type": "quick_question", "category": "general"}'),
    ('Kiedy mogę przejść na emeryturę?', '{"type": "quick_question", "category": "general"}'),
    ('Jak obliczane są składki ZUS?', '{"type": "quick_question", "category": "contributions"}'),
    ('Co to jest kapitał początkowy?', '{"type": "quick_question", "category": "calculations"}'),
    ('Jak zwiększyć wysokość emerytury?', '{"type": "quick_question", "category": "optimization"}'),
    ('Co oznacza stopa zastąpienia?', '{"type": "quick_question", "category": "calculations"}')
) AS quick_questions(question, metadata);