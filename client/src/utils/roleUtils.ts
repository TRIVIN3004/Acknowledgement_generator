export interface RoleDetails {
  title: string;
  department: string;
  responsibilities: string[];
}

export const getFallbackRoleDetails = (dept?: string, roleTitle?: string): RoleDetails => {
  const d = (dept || '').toLowerCase();
  const t = (roleTitle || '').toLowerCase();

  if (d.includes('qa') || d.includes('quality') || t.includes('qa') || t.includes('quality')) {
    return {
      title: roleTitle && roleTitle !== 'Unknown Role' ? roleTitle : 'QA Engineer',
      department: 'Quality Assurance',
      responsibilities: [
        'Formulate comprehensive test plans, end-to-end test cases, and quality matrices.',
        'Perform automated UI testing and REST API verification.',
        'Audit edge cases, boundary security conditions, and cross-device compatibility.',
        'Track bug lifecycle and validate production deployment readiness.'
      ]
    };
  }

  if (d.includes('design') || t.includes('design') || t.includes('ux') || t.includes('ui')) {
    return {
      title: roleTitle && roleTitle !== 'Unknown Role' ? roleTitle : 'UI/UX Designer',
      department: 'Design',
      responsibilities: [
        'Conduct user research and create interactive wireframes and prototypes.',
        'Build and maintain design systems and visual component libraries.',
        'Collaborate with engineering leads on user interface implementation.'
      ]
    };
  }

  if (d.includes('ai') || d.includes('data') || t.includes('ai') || t.includes('data')) {
    return {
      title: roleTitle && roleTitle !== 'Unknown Role' ? roleTitle : 'AI Engineer',
      department: 'AI & Data Science',
      responsibilities: [
        'Develop and fine-tune machine learning and natural language processing pipelines.',
        'Architect vector search indexing with semantic embedding models.',
        'Evaluate model accuracy, latency, and guardrails.'
      ]
    };
  }

  if (d.includes('management') || t.includes('lead') || t.includes('manager')) {
    return {
      title: roleTitle && roleTitle !== 'Unknown Role' ? roleTitle : 'Project Manager',
      department: 'Management',
      responsibilities: [
        'Coordinate project deliverables, milestones, and sprint timelines.',
        'Facilitate cross-functional communication and resource allocation.',
        'Ensure compliance with enterprise standards and project scope.'
      ]
    };
  }

  return {
    title: roleTitle && roleTitle !== 'Unknown Role' ? roleTitle : 'Software Engineer',
    department: 'Engineering',
    responsibilities: [
      'Develop, test, and deliver modular application features.',
      'Collaborate with project leads and cross-functional engineering team members.',
      'Maintain clean code principles and digital signature verification compliance.'
    ]
  };
};
