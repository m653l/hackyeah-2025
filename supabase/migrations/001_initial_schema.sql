-- Symulator Emerytalny ZUS - Initial Database Schema
-- Utworzenie tabel do zbierania danych użytkowników (hackathon)

-- Główna tabela symulacji użytkowników
CREATE TABLE user_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dane wejściowe użytkownika
    age INTEGER NOT NULL,
    gender VARCHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    salary DECIMAL(10,2) NOT NULL,
    work_start_year INTEGER NOT NULL,
    work_end_year INTEGER NOT NULL,
    current_savings DECIMAL(12,2),
    work_experience_1998 INTEGER,
    include_sickness BOOLEAN DEFAULT false,
    expected_pension DECIMAL(10,2),
    postal_code VARCHAR(6),
    
    -- Parametry FUS20 i Dashboard
    fus20_variant INTEGER NOT NULL CHECK (fus20_variant IN (1, 2, 3)),
    unemployment_rate DECIMAL(5,2),
    real_wage_growth DECIMAL(5,2),
    inflation_rate DECIMAL(5,2),
    contribution_collection DECIMAL(5,2),
    
    -- Wyniki symulacji
    pension_amount DECIMAL(10,2) NOT NULL,
    pension_amount_real DECIMAL(10,2),
    replacement_rate DECIMAL(5,2),
    with_sickness DECIMAL(10,2),
    without_sickness DECIMAL(10,2),
    initial_capital DECIMAL(12,2),
    estimated_savings DECIMAL(12,2),
    total_contributions DECIMAL(12,2),
    
    -- Metadane
    session_id VARCHAR(50),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculation_duration_ms INTEGER,
    
    -- Walidacja danych
    CONSTRAINT valid_age CHECK (age >= 18 AND age <= 100),
    CONSTRAINT valid_years CHECK (work_end_year >= work_start_year)
);

-- Tabela korzyści z odroczenia emerytury
CREATE TABLE simulation_delays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID REFERENCES user_simulations(id) ON DELETE CASCADE,
    
    delay_years INTEGER NOT NULL CHECK (delay_years IN (1, 2, 5)),
    delayed_pension_amount DECIMAL(10,2) NOT NULL,
    benefit_increase_percent DECIMAL(5,2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela kontekstu powiatowego
CREATE TABLE county_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID REFERENCES user_simulations(id) ON DELETE CASCADE,
    
    county_name VARCHAR(100),
    highest_pension DECIMAL(10,2),
    lowest_pension DECIMAL(10,2),
    average_pension DECIMAL(10,2),
    user_vs_average_percent DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela kontekstu zawodowego
CREATE TABLE professional_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID REFERENCES user_simulations(id) ON DELETE CASCADE,
    
    insurance_title_code VARCHAR(10),
    profession_name VARCHAR(200),
    average_pension DECIMAL(10,2),
    user_vs_profession_percent DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela logów użycia systemu
CREATE TABLE system_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    event_type VARCHAR(50) NOT NULL, -- 'form_start', 'calculation_complete', 'report_download', 'dashboard_access'
    page_path VARCHAR(200),
    session_id VARCHAR(50),
    user_agent TEXT,
    ip_address INET,
    
    -- Dodatkowe dane kontekstowe
    event_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indeksy dla wydajności
CREATE INDEX idx_user_simulations_created_at ON user_simulations(created_at DESC);
CREATE INDEX idx_user_simulations_fus20_variant ON user_simulations(fus20_variant);
CREATE INDEX idx_user_simulations_age_gender ON user_simulations(age, gender);
CREATE INDEX idx_user_simulations_postal_code ON user_simulations(postal_code);
CREATE INDEX idx_simulation_delays_simulation_id ON simulation_delays(simulation_id);
CREATE INDEX idx_county_context_simulation_id ON county_context(simulation_id);
CREATE INDEX idx_professional_context_simulation_id ON professional_context(simulation_id);
CREATE INDEX idx_system_usage_logs_created_at ON system_usage_logs(created_at DESC);
CREATE INDEX idx_system_usage_logs_event_type ON system_usage_logs(event_type);
CREATE INDEX idx_system_usage_logs_session_id ON system_usage_logs(session_id);

-- Wyłączenie RLS dla tabel publicznych (hackathon)
ALTER TABLE user_simulations DISABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_delays DISABLE ROW LEVEL SECURITY;
ALTER TABLE county_context DISABLE ROW LEVEL SECURITY;
ALTER TABLE professional_context DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_usage_logs DISABLE ROW LEVEL SECURITY;

-- Uprawnienia dla roli anon (publiczny dostęp do zapisu)
GRANT INSERT ON user_simulations TO anon;
GRANT INSERT ON simulation_delays TO anon;
GRANT INSERT ON county_context TO anon;
GRANT INSERT ON professional_context TO anon;
GRANT INSERT ON system_usage_logs TO anon;

-- Uprawnienia dla roli authenticated (panel admin)
GRANT ALL PRIVILEGES ON user_simulations TO authenticated;
GRANT ALL PRIVILEGES ON simulation_delays TO authenticated;
GRANT ALL PRIVILEGES ON county_context TO authenticated;
GRANT ALL PRIVILEGES ON professional_context TO authenticated;
GRANT ALL PRIVILEGES ON system_usage_logs TO authenticated;