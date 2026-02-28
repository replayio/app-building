import type { Handler } from '@netlify/functions';

interface LogEntry {
  id: string;
  appId: string;
  timestamp: string;
  category: string;
  message: string;
  codeSnippet: string | null;
}

const mockLogs: Record<string, LogEntry[]> = {
  'saas-platform': [
    {
      id: 'log-1',
      appId: 'saas-platform',
      timestamp: '2026-02-20T13:55:00Z',
      category: 'INIT',
      message: "App creation initiated from prompt: 'Create a SaaS customer portal MVP with auth, dashboard, and reporting.' Project structure initialized.",
      codeSnippet: null,
    },
    {
      id: 'log-2',
      appId: 'saas-platform',
      timestamp: '2026-02-20T14:00:01Z',
      category: 'PLAN',
      message: 'Initial project plan generated. Key feature modules identified: Authentication, User Dashboard, Reporting, and Settings. Starting development with the Auth module.',
      codeSnippet: null,
    },
    {
      id: 'log-3',
      appId: 'saas-platform',
      timestamp: '2026-02-21T14:15:45Z',
      category: 'REASONING',
      message: 'Designing the database schema for the "Reporting Module". Considering relational versus document structure. Decided to use a relational approach with PostgreSQL for data integrity. Generating Prisma schema definitions...',
      codeSnippet: 'model Report {\n  id        String @id @default(cuid());\n  title     String;\n  data      Json;\n  createdAt DateTime @default(now());\n  userId    String;\n  user      User @relation(fields: [userId], references: [id]);\n}',
    },
    {
      id: 'log-4',
      appId: 'saas-platform',
      timestamp: '2026-02-22T14:30:15Z',
      category: 'TEST',
      message: 'Running automated integration tests for the Reporting Module. 15/15 tests passed. Generating test report.',
      codeSnippet: null,
    },
    {
      id: 'log-5',
      appId: 'saas-platform',
      timestamp: '2026-02-22T14:35:22Z',
      category: 'DEPLOY',
      message: 'Deployment successful. App is live at https://my-saas-platform.vercel.app. Final verification complete.',
      codeSnippet: null,
    },
  ],
  'inventory-management': [
    {
      id: 'log-6',
      appId: 'inventory-management',
      timestamp: '2026-02-25T10:00:00Z',
      category: 'INIT',
      message: "App creation initiated from prompt: 'Build an inventory management system with real-time stock tracking.' Project structure initialized.",
      codeSnippet: null,
    },
    {
      id: 'log-7',
      appId: 'inventory-management',
      timestamp: '2026-02-25T10:15:00Z',
      category: 'PLAN',
      message: 'Planning module architecture. Core modules: Product Catalog, Stock Levels, Supplier Integration, Order Management, and Analytics Dashboard.',
      codeSnippet: null,
    },
    {
      id: 'log-8',
      appId: 'inventory-management',
      timestamp: '2026-02-26T11:30:00Z',
      category: 'BUILD',
      message: 'Building the Product Catalog module. Creating CRUD endpoints and React components for product listing, detail views, and search functionality.',
      codeSnippet: null,
    },
    {
      id: 'log-9',
      appId: 'inventory-management',
      timestamp: '2026-02-27T09:45:00Z',
      category: 'REASONING',
      message: 'Evaluating real-time stock update strategies. WebSocket vs polling. Choosing WebSocket for sub-second latency requirements. Implementing socket server...',
      codeSnippet: 'const wss = new WebSocketServer({ port: 8080 });\nwss.on("connection", (ws) => {\n  ws.on("message", (data) => {\n    const update = JSON.parse(data);\n    broadcastStockUpdate(update);\n  });\n});',
    },
    {
      id: 'log-10',
      appId: 'inventory-management',
      timestamp: '2026-02-28T08:00:00Z',
      category: 'TEST',
      message: 'Running integration tests for Stock Levels module. 12/14 tests passed. 2 failing tests related to concurrent stock updates. Investigating race condition...',
      codeSnippet: null,
    },
  ],
  'customer-support-chatbot': [
    {
      id: 'log-11',
      appId: 'customer-support-chatbot',
      timestamp: '2026-02-26T14:30:00Z',
      category: 'INIT',
      message: "App creation initiated from prompt: 'Create an AI customer support chatbot with NLP capabilities.' Project structure initialized.",
      codeSnippet: null,
    },
    {
      id: 'log-12',
      appId: 'customer-support-chatbot',
      timestamp: '2026-02-26T14:45:00Z',
      category: 'PLAN',
      message: 'Architecture planning complete. Modules: Chat Interface, NLP Pipeline, Knowledge Base, Ticket Escalation, and Analytics.',
      codeSnippet: null,
    },
    {
      id: 'log-13',
      appId: 'customer-support-chatbot',
      timestamp: '2026-02-27T10:00:00Z',
      category: 'BUILD',
      message: 'Building chat interface component with message threading, typing indicators, and attachment support.',
      codeSnippet: null,
    },
  ],
  'financial-reporting-dashboard': [
    {
      id: 'log-14',
      appId: 'financial-reporting-dashboard',
      timestamp: '2026-02-26T09:15:00Z',
      category: 'INIT',
      message: "App creation initiated. Building automated financial reporting dashboard with real-time KPI tracking.",
      codeSnippet: null,
    },
    {
      id: 'log-15',
      appId: 'financial-reporting-dashboard',
      timestamp: '2026-02-26T09:30:00Z',
      category: 'PLAN',
      message: 'Planning dashboard layout. Core widgets: Revenue Chart, Expense Breakdown, Cash Flow, P&L Statement, and Budget vs Actual comparison.',
      codeSnippet: null,
    },
    {
      id: 'log-16',
      appId: 'financial-reporting-dashboard',
      timestamp: '2026-02-27T14:00:00Z',
      category: 'BUILD',
      message: 'Implementing chart components using D3.js for interactive financial data visualization. Building revenue and expense trend charts.',
      codeSnippet: null,
    },
  ],
  'social-media-planner': [
    {
      id: 'log-17',
      appId: 'social-media-planner',
      timestamp: '2026-02-27T08:00:00Z',
      category: 'INIT',
      message: "App creation initiated. Building social media content planner with scheduling and analytics.",
      codeSnippet: null,
    },
    {
      id: 'log-18',
      appId: 'social-media-planner',
      timestamp: '2026-02-27T08:20:00Z',
      category: 'PLAN',
      message: 'Module plan: Content Calendar, Post Composer, Analytics Dashboard, AI Content Suggestions, and Multi-platform Integration.',
      codeSnippet: null,
    },
  ],
};

function getDefaultLogs(appId: string): LogEntry[] {
  return [
    {
      id: `${appId}-default-1`,
      appId,
      timestamp: new Date().toISOString(),
      category: 'INIT',
      message: 'App is queued for building. Development has not yet started.',
      codeSnippet: null,
    },
  ];
}

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

  const appId = event.queryStringParameters?.appId;

  if (!appId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'appId query parameter is required' }) };
  }

  const logs = mockLogs[appId] || getDefaultLogs(appId);
  // Sort newest first
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { statusCode: 200, headers, body: JSON.stringify(sorted) };
};

export { handler };
