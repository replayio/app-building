import type { Handler } from '@netlify/functions';

interface AppRecord {
  id: string;
  title: string;
  description: string;
  status: 'building' | 'finished' | 'queued';
  progress: number;
  createdAt: string;
  completedAt: string | null;
  liveUrl: string | null;
  model: string;
  deployment: string | null;
}

const mockApps: AppRecord[] = [
  {
    id: 'inventory-management',
    title: 'Inventory Management System',
    description: 'Autonomous system to track and order stock in real-time, integrating with suppliers and sales data.',
    status: 'building',
    progress: 65,
    createdAt: '2026-02-25T10:00:00Z',
    completedAt: null,
    liveUrl: null,
    model: 'Claude Opus 4',
    deployment: null,
  },
  {
    id: 'customer-support-chatbot',
    title: 'Customer Support Chatbot',
    description: 'AI-powered bot for 24/7 customer inquiries, including natural language processing and issue resolution.',
    status: 'building',
    progress: 30,
    createdAt: '2026-02-26T14:30:00Z',
    completedAt: null,
    liveUrl: null,
    model: 'Claude Opus 4',
    deployment: null,
  },
  {
    id: 'financial-reporting-dashboard',
    title: 'Financial Reporting Dashboard',
    description: 'Automated generation of financial statements, forecasts, and real-time KPI tracking.',
    status: 'building',
    progress: 43,
    createdAt: '2026-02-26T09:15:00Z',
    completedAt: null,
    liveUrl: null,
    model: 'Claude Sonnet 4',
    deployment: null,
  },
  {
    id: 'social-media-planner',
    title: 'Social Media Content Planner',
    description: 'Intelligent tool for scheduling posts, analyzing engagement, and suggesting content ideas.',
    status: 'building',
    progress: 30,
    createdAt: '2026-02-27T08:00:00Z',
    completedAt: null,
    liveUrl: null,
    model: 'Claude Opus 4',
    deployment: null,
  },
  {
    id: 'saas-platform',
    title: 'My Saas Platform (Customer Portal MVP)',
    description: 'An autonomously generated web application. Features user authentication, dashboard, and reporting module. Built with React and Node.js.',
    status: 'finished',
    progress: 100,
    createdAt: '2026-02-20T13:55:00Z',
    completedAt: '2026-02-22T14:35:22Z',
    liveUrl: 'https://my-saas-platform.vercel.app',
    model: 'Claude Opus 4',
    deployment: 'Vercel',
  },
  {
    id: 'recipe-finder',
    title: 'Recipe Finder App',
    description: 'Search and discover recipes by ingredients, dietary preferences, and cuisine type with meal planning features.',
    status: 'finished',
    progress: 100,
    createdAt: '2026-02-18T11:00:00Z',
    completedAt: '2026-02-19T16:20:00Z',
    liveUrl: 'https://recipe-finder-demo.netlify.app',
    model: 'Claude Sonnet 4',
    deployment: 'Netlify',
  },
  {
    id: 'project-tracker',
    title: 'Project Tracker',
    description: 'Kanban-style project management tool with team collaboration, deadlines, and progress visualization.',
    status: 'finished',
    progress: 100,
    createdAt: '2026-02-15T09:00:00Z',
    completedAt: '2026-02-17T12:45:00Z',
    liveUrl: 'https://project-tracker-app.netlify.app',
    model: 'Claude Opus 4',
    deployment: 'Netlify',
  },
  {
    id: 'weather-dashboard',
    title: 'Weather Dashboard',
    description: 'Real-time weather monitoring with forecasts, alerts, and historical data visualization for multiple locations.',
    status: 'queued',
    progress: 0,
    createdAt: '2026-02-28T07:30:00Z',
    completedAt: null,
    liveUrl: null,
    model: 'Claude Opus 4',
    deployment: null,
  },
  {
    id: 'expense-tracker',
    title: 'Expense Tracker',
    description: 'Personal finance app for tracking daily expenses, categorizing spending, and generating budget reports.',
    status: 'queued',
    progress: 0,
    createdAt: '2026-02-28T09:15:00Z',
    completedAt: null,
    liveUrl: null,
    model: 'Claude Sonnet 4',
    deployment: null,
  },
  {
    id: 'blog-cms',
    title: 'Blog CMS',
    description: 'Content management system with markdown editor, SEO tools, and multi-author support.',
    status: 'queued',
    progress: 0,
    createdAt: '2026-02-28T10:00:00Z',
    completedAt: null,
    liveUrl: null,
    model: 'Claude Opus 4',
    deployment: null,
  },
];

const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const segments = event.path.split('/').filter(Boolean);
  // /.netlify/functions/apps/:id → segments: ['.netlify', 'functions', 'apps', ':id']
  const appId = segments[3];

  if (appId) {
    const app = mockApps.find((a) => a.id === appId);
    if (!app) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'App not found' }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify(app) };
  }

  const status = event.queryStringParameters?.status;
  let filtered = mockApps;
  if (status && (status === 'building' || status === 'finished' || status === 'queued')) {
    filtered = mockApps.filter((a) => a.status === status);
  }

  return { statusCode: 200, headers, body: JSON.stringify(filtered) };
};

export { handler };
