-- ========================================================
-- NEXORA TECHNOLOGIES - PRDAMS SUPABASE DATABASE SCHEMA
-- ========================================================
-- Safe SQL schema creation script for your NEW Supabase Database.
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    department TEXT DEFAULT 'Software Engineering',
    college TEXT DEFAULT 'Institute of Technology',
    phone TEXT DEFAULT '+1 (555) 000-0000',
    skills TEXT[] DEFAULT '{}',
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'active')) DEFAULT 'active',
    member_id TEXT,
    avatar_url TEXT,
    default_signature TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'Enterprise Web Application',
    technology_stack TEXT[] DEFAULT '{}',
    lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    lead_name TEXT DEFAULT 'Project Lead',
    deadline DATE NOT NULL,
    status TEXT CHECK (status IN ('planning', 'in_progress', 'completed', 'archived')) DEFAULT 'planning',
    timeline_assigned_at TIMESTAMPTZ DEFAULT NOW(),
    timeline_accepted_at TIMESTAMPTZ,
    timeline_started_at TIMESTAMPTZ,
    timeline_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROLES CATALOG TABLE
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'Engineering',
    department TEXT DEFAULT 'Software Development',
    responsibilities TEXT[] DEFAULT '{}',
    required_skills TEXT[] DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    member_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'change_requested')) DEFAULT 'pending',
    change_note TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- 5. ACKNOWLEDGEMENTS TABLE
CREATE TABLE IF NOT EXISTS acknowledgements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    member_id UUID REFERENCES users(id) ON DELETE CASCADE,
    signature_type TEXT CHECK (signature_type IN ('draw', 'upload', 'type')) NOT NULL,
    signature_data TEXT NOT NULL,
    typed_name TEXT,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    consent_accepted BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    qr_code_hash TEXT UNIQUE NOT NULL,
    pdf_url TEXT
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('assignment', 'acceptance', 'reminder', 'deadline', 'system')) DEFAULT 'system',
    read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    performed_by_name TEXT NOT NULL,
    performed_by_role TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS) & OPEN PERMISSIONS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow full read/write access for application API queries
CREATE POLICY "Allow full access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to roles" ON roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to acknowledgements" ON acknowledgements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
