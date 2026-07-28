-- ========================================================
-- NEXORA TECHNOLOGIES - SUPABASE SEED DATA SCRIPT (NO AVATARS)
-- Paste this into your Supabase SQL Editor: https://supabase.com/dashboard/project/kuvlsmcdxxfspabovunh/sql/new
-- ========================================================

-- 1. INSERT DEFAULT ROLES
INSERT INTO roles (id, title, category, department, responsibilities, required_skills, description)
VALUES
('11111111-1111-1111-1111-111111111111', 'Frontend Developer', 'Engineering', 'Engineering', ARRAY['Develop UI components', 'Integrate APIs'], ARRAY['React', 'TypeScript'], 'Frontend Specialist'),
('22222222-2222-2222-2222-222222222222', 'Backend Developer', 'Engineering', 'Engineering', ARRAY['API Endpoints', 'Database Migration'], ARRAY['Node.js', 'PostgreSQL'], 'Backend Specialist'),
('33333333-3333-3333-3333-333333333333', 'AI Engineer', 'Engineering', 'AI & Data Science', ARRAY['Train LLM models', 'Vector DB search'], ARRAY['Python', 'PyTorch'], 'AI Specialist'),
('44444444-4444-4444-4444-444444444444', 'UI/UX Designer', 'Design', 'Design', ARRAY['User wireframes', 'Figma prototypes'], ARRAY['Figma', 'UI Design'], 'Design Specialist')
ON CONFLICT (title) DO NOTHING;

-- 2. INSERT USERS (NO AVATAR URLs)
INSERT INTO users (name, email, password_hash, role, department, member_id, phone, avatar_url, status)
VALUES
('TRIVIN S', 'trivin@nexora.com', 'Trivin@123', 'member', 'Engineering', 'EMP-0001', '+919344048472', '', 'active'),
('Trivin', 'testing@nexora.com', 'Trivin@123', 'admin', 'Management', 'EMP-001', '+1 (555) 019-2834', '', 'active'),
('Aakashraj', 'aakashraj@nexora.com', 'Akash0709', 'member', 'Engineering', 'EMP-002', '9445360088', '', 'active'),
('Gopika', 'gopika@nexora.com', 'Gopika@123', 'member', 'Design', 'EMP-003', '+1 (555) 019-9481', '', 'active'),
('Akshaya', 'akshaya@nexora.com', 'Ashraj@2005', 'member', 'Engineering', 'EMP-004', '+1 (555) 019-3382', '', 'active'),
('Amirtha', 'amirtha@nexora.com', 'Amy@2205', 'member', 'Engineering', 'EMP-005', '+1 (555) 019-7482', '', 'active'),
('Pavithraa', 'pavithraa@nexora.com', '123456', 'member', 'Quality Assurance', 'EMP-006', '+1 (555) 019-2910', '', 'active'),
('Sujitha', 'sujitha@nexora.com', 'suji.sk9m', 'member', 'Engineering', 'EMP-007', '+1 (555) 019-8739', '', 'active'),
('Sangamithra', 'sangamithra@nexora.com', 'Mithra@05$', 'member', 'Design', 'EMP-008', '+1 (555) 019-1144', '', 'active'),
('Aaryan', 'aaryan@nexora.com', 'qwerty', 'member', 'Engineering', 'EMP-010', '+1 (555) 019-7431', '', 'active'),
('Ajay kumar D', 'ajaykumar@nexora.com', 'Ajaynexora@', 'member', 'Engineering', 'EMP-011', '8072753848', '', 'active'),
('Pathmavathi', 'pathmavathi@nexora.com', 'Pathmavathi@123', 'member', 'Management', 'EMP-012', '+1 (555) 019-1229', '', 'active'),
('Pooja', 'pooja@nexora.com', '12345678', 'member', 'Design', 'EMP-013', '+1 (555) 019-4820', '', 'active'),
('Aarathana', 'aarathana@nexora.com', '123456', 'member', 'Engineering', 'EMP-014', '+1 (555) 019-3349', '', 'active'),
('Gokulashri', 'gokulashri@nexora.com', '123456', 'member', 'Engineering', 'EMP-015', '+1 (555) 019-2283', '', 'active'),
('Karthikeyan', 'karthikeyan@nexora.com', 'karthi2606', 'member', 'Engineering', 'EMP-016', '+1 (555) 019-2248', '', 'active'),
('Sanjay Kumar', 'sanjaykumar@nexora.com', '123456', 'member', 'Engineering', 'EMP-018', '+1 (555) 019-9944', '', 'active'),
('Sanjay', 'sanjay@nexora.com', 'sanjayvijay1529', 'member', 'Design', 'EMP-019', '+1 (555) 019-8812', '', 'active'),
('Vishwa', 'vishwa@nexora.com', 'vishwa@7', 'member', 'Engineering', 'EMP-020', '+1 (555) 019-4821', '', 'active'),
('Shakthi', 'shakthi@nexora.com', 'shakthij7', 'member', 'Engineering', 'EMP-021', '+1 (555) 019-4810', '', 'active'),
('Farman', 'farman@nexora.com', 'Farman234', 'member', 'Engineering', 'EMP-022', '+1 (555) 019-9182', '', 'active'),
('Gokul', 'gokul@nexora.com', 'Gokulpriyan@102', 'member', 'Engineering', 'EMP-023', '+1 (555) 019-8139', '', 'active'),
('Naveen', 'naveen@nexora.com', 'Naveen20061980@@', 'member', 'Engineering', 'EMP-024', '8148602395', '', 'active'),
('ARUTSELVAN U', 'arutselvan@nexora.com', '123456', 'member', 'Engineering', 'EMP-025', '+917812891604', '', 'active'),
('Sanjay T', 'sanjayt@nexora.com', 'Abcd@1234', 'member', 'Engineering', 'EMP-026', '+91 75399 88018', '', 'active'),
('Anish', 'anish@nexora.com', '5846240', 'member', 'Engineering', 'EMP-027', '+91 90805 07940', '', 'active'),
('Sivaranjini', 'sivaranjini@nexora.com', '17031999', 'member', 'Engineering', 'EMP-028', '+91 63840 49668', '', 'active'),
('Santhoshraj', 'santhoshraj@nexora.com', 'Santhoshraj@123', 'member', 'Engineering', 'EMP-029', '+91 89257 08938', '', 'active'),
('Rohith', 'rohit@nexora.com', 'Rohith@2005.', 'member', 'Engineering', 'EMP-030', '+91 96269 97021', '', 'active'),
('Prishaa Kamal P', 'prisha@nexora.com', 'Prishaa@06', 'member', 'Engineering', 'EMP-031', '+91 63811 62502', '', 'active'),
('Srinithi', 'srinithi@nexora.com', 'srinithi19@', 'member', 'Engineering', 'EMP-032', '+91 84382 72389', '', 'active'),
('Dinesh', 'dinesh@nexora.com', '06102007', 'member', 'Engineering', 'EMP-033', '6381153191', '', 'active'),
('vishnu hasan R', 'vishnu@nexora.com', 'Vishnu30426', 'member', 'Engineering', 'EMP-034', '9790811943', '', 'active'),
('SANJAY S', 'sanjays@nexora.com', 'Dv2Sg5Hq9c9ZEMT', 'member', 'Engineering', 'EMP-035', '+91 70101 66482', '', 'active'),
('BHARATH G', 'bharath@nexora.com', '123456', 'member', 'Engineering', 'EMP-036', '+91 85240 93856', '', 'active'),
('Sharon', 'sharon@nexora.com', '292206', 'member', 'Engineering', 'EMP-037', '+91 90429 88684', '', 'active'),
('Nidiya', 'nidiya@nexora.com', 'Nidi$1926', 'member', 'Engineering', 'EMP-038', '+91 70941 69032', '', 'active'),
('Madona', 'madona@nexora.com', 'M1@2d3o4n5@6', 'member', 'Engineering', 'EMP-039', '+91 94452 42902', '', 'active'),
('Kiruthika', 'kiruthika@nexora.com', '123456', 'member', 'Engineering', 'EMP-041', '+919360815338', '', 'active'),
('Yani Muizz', 'yani@nexora.com', 'inay@0326', 'member', 'Engineering', 'EMP-042', '+918682986258', '', 'active'),
('Waseem Ahmed', 'waseem@nexora.com', '741852', 'member', 'Engineering', 'EMP-043', '+916374456261', '', 'active'),
('Kanimozhi', 'kanimozhi@nexora.com', 'kani@10', 'member', 'Engineering', 'EMP-40', '+91 80982 05811', '', 'active')
ON CONFLICT (email) DO NOTHING;

-- 3. INSERT EXTRACTED NEXORA PROJECTS
INSERT INTO projects (title, description, category, technology_stack, deadline, status)
VALUES
('AI smart Recruitment platform', 'Enterprise AI smart Recruitment platform software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress'),
('Nexora AI (parakit AI)', 'Enterprise Nexora AI (parakit AI) software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress'),
('Nexora ERP', 'Enterprise Nexora ERP software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress'),
('AI powered internship management', 'Enterprise AI powered internship management software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress'),
('AI interview preparation assistant', 'Enterprise AI interview preparation assistant software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress'),
('lekquant website', 'Enterprise lekquant website software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress'),
('AI resume screening system', 'Enterprise AI resume screening system software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress'),
('AI Powered Customer Support Chatbot', 'Enterprise AI Powered Customer Support Chatbot software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress'),
('Electrical and plumbing design', 'Enterprise Electrical and plumbing design software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress'),
('Supermarket project', 'Enterprise Supermarket project software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress'),
('Parent teacher app', 'Enterprise Parent teacher app software platform developed by Nexora Technologies.', 'Software Engineering', ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'], '2026-12-31', 'in_progress');
