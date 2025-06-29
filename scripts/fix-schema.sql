-- Fix Supabase schema cache issues by recreating the projects table
-- Run this in your Supabase SQL Editor if the schema refresh doesn't work

-- First, backup any existing data (if you have any)
-- CREATE TABLE projects_backup AS SELECT * FROM projects;

-- Drop existing tables in the correct order (due to foreign keys)
DROP TABLE IF EXISTS project_data CASCADE;
DROP TABLE IF EXISTS project_tools CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Recreate projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'Other',
    is_public BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]'::jsonb,
    user_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate project_tools table
CREATE TABLE project_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tool_name VARCHAR(50) NOT NULL CHECK (tool_name IN ('datashark', 'queryhammerhead', 'vizfin')),
    tool_config JSONB DEFAULT '{}'::jsonb,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, tool_name)
);

-- Recreate project_data table
CREATE TABLE project_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tool_name VARCHAR(50) NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('scraping_result', 'visualization', 'query_result')),
    data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);

CREATE INDEX idx_project_tools_project_id ON project_tools(project_id);
CREATE INDEX idx_project_tools_tool_name ON project_tools(tool_name);

CREATE INDEX idx_project_data_project_id ON project_data(project_id);
CREATE INDEX idx_project_data_tool_name ON project_data(tool_name);
CREATE INDEX idx_project_data_data_type ON project_data(data_type);
CREATE INDEX idx_project_data_created_at ON project_data(created_at);

-- Recreate triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tools_updated_at 
    BEFORE UPDATE ON project_tools 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_data ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public projects" ON projects
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage tools for their projects" ON project_tools
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_tools.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage data for their projects" ON project_data
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_data.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Force schema refresh
NOTIFY pgrst, 'reload schema';

-- Verify the table was created correctly
SELECT 'Projects table created successfully' as status,
       column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position; 