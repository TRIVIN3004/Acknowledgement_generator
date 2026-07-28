import { parseUsersCsv } from '../scripts/processCsvToSeed.js';

export const getInitialData = () => {
  const csvData = parseUsersCsv();

  const fallbackUsers = [
    {
      id: 'EMP-001',
      _id: 'EMP-001',
      name: 'Trivin (Admin)',
      email: 'testing@nexora.com',
      passwordHash: 'Trivin@123',
      role: 'admin',
      department: 'Management',
      college: 'Nexora Technologies',
      phone: '+1 (555) 019-2834',
      skills: ['Management', 'System Architecture', 'DevOps', 'Strategic Planning'],
      status: 'active',
      memberId: 'EMP-001',
      avatarUrl: '', // Profile picture removed
      createdAt: '2026-01-10T08:00:00.000Z'
    },
    {
      id: 'EMP-002',
      _id: 'EMP-002',
      name: 'Aakashraj',
      email: 'aakashraj@nexora.com',
      passwordHash: 'Akash0709',
      role: 'member',
      department: 'Engineering',
      college: 'Nexora Technologies',
      phone: '9445360088',
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      status: 'active',
      memberId: 'EMP-002',
      avatarUrl: '', // Profile picture removed
      createdAt: '2026-01-15T09:30:00.000Z'
    }
  ];

  // Remove avatarUrl from all parsed users
  const cleanCsvUsers = csvData.users.map(u => ({ ...u, avatarUrl: '' }));
  const users = cleanCsvUsers.length > 0 ? cleanCsvUsers : fallbackUsers;

  const fallbackProjects = [
    {
      id: 'proj-1',
      _id: 'proj-1',
      title: 'Nexora ERP',
      description: 'Enterprise ERP application built by Nexora Technologies.',
      category: 'Enterprise Web Application',
      technologyStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      leadId: 'EMP-001',
      leadName: 'Trivin (Admin)',
      deadline: '2026-11-30',
      status: 'in_progress',
      timeline: {
        assignedAt: '2026-02-01T09:00:00.000Z',
        startedAt: '2026-02-05T08:00:00.000Z'
      },
      createdAt: '2026-02-01T09:00:00.000Z'
    }
  ];

  const projects: any[] = [];
  const assignments: any[] = [];

  const roles = [
    {
      id: 'role-1',
      _id: 'role-1',
      title: 'Frontend Developer',
      category: 'Frontend Engineering',
      department: 'Engineering',
      responsibilities: [
        'Build responsive, pixel-perfect user interface components using React & TypeScript',
        'Integrate RESTful APIs and handle real-time WebSocket state streaming',
        'Implement accessibility (WCAG 2.1) and cross-browser visual verification'
      ],
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS'],
      description: 'Responsible for client-facing user interfaces and responsive UX interactions.'
    },
    {
      id: 'role-2',
      _id: 'role-2',
      title: 'Backend Developer',
      category: 'Backend Engineering',
      department: 'Engineering',
      responsibilities: [
        'Design scalable REST endpoints in Express / Node.js',
        'Manage PostgreSQL/MongoDB database indexing and query optimization'
      ],
      requiredSkills: ['Node.js', 'Express', 'PostgreSQL', 'TypeScript'],
      description: 'Focuses on server architecture and data processing.'
    },
    {
      id: 'role-3',
      _id: 'role-3',
      title: 'AI Engineer',
      category: 'Artificial Intelligence',
      department: 'AI & Data Science',
      responsibilities: [
        'Develop and fine-tune machine learning and natural language processing pipelines',
        'Architect vector search indexing with semantic embedding models'
      ],
      requiredSkills: ['Python', 'PyTorch', 'LangChain', 'Transformers'],
      description: 'Drives artificial intelligence models and semantic retrieval integration.'
    },
    {
      id: 'role-4',
      _id: 'role-4',
      title: 'UI/UX Designer',
      category: 'Product Design',
      department: 'Design',
      responsibilities: [
        'Conduct user research and create interactive wireframes',
        'Build and maintain design systems in Figma'
      ],
      requiredSkills: ['Figma', 'User Research', 'Design Systems'],
      description: 'Crafts intuitive, aesthetically stunning digital interfaces.'
    },
    {
      id: 'role-5',
      _id: 'role-5',
      title: 'QA Engineer',
      category: 'Quality Assurance',
      department: 'Quality Assurance',
      responsibilities: [
        'Formulate comprehensive test plans and quality matrices',
        'Perform automated UI testing and REST API verification'
      ],
      requiredSkills: ['Jest', 'Playwright', 'API Testing'],
      description: 'Guarantees software quality and product reliability.'
    }
  ];

  const acknowledgements: any[] = [];
  const notifications: any[] = [];
  const auditLogs: any[] = [
    {
      id: 'log-1',
      _id: 'log-1',
      action: 'NEXORA_DATABASE_LOADED',
      performedBy: 'EMP-001',
      performedByName: 'Trivin (Admin)',
      performedByRole: 'admin',
      targetType: 'SYSTEM',
      targetId: 'users_rows.csv',
      details: `Loaded ${users.length} employee accounts without profile pictures.`,
      timestamp: new Date().toISOString()
    }
  ];

  return { users, projects, roles, assignments, acknowledgements, notifications, auditLogs };
};
