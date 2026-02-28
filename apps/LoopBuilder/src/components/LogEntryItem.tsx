import { useState } from 'react';
import {
  CheckCircle,
  Info,
  Settings,
  AlertTriangle,
  Rocket,
  Code,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { ActivityLogEntry, LogCategory } from '../types';

interface LogEntryItemProps {
  entry: ActivityLogEntry;
}

function getCategoryIcon(category: LogCategory) {
  switch (category) {
    case 'DEPLOY':
      return <CheckCircle size={18} color="var(--color-category-deploy)" />;
    case 'TEST':
      return <Info size={18} color="var(--color-category-test)" />;
    case 'REASONING':
      return <Settings size={18} color="var(--color-category-reasoning)" />;
    case 'PLAN':
      return <Info size={18} color="var(--color-category-plan)" />;
    case 'INIT':
      return <Rocket size={18} color="var(--color-category-init)" />;
    case 'BUILD':
      return <Code size={18} color="var(--color-category-build)" />;
    case 'ERROR':
      return <AlertTriangle size={18} color="var(--color-category-error)" />;
    default:
      return <Info size={18} color="var(--color-text-muted)" />;
  }
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function LogEntryItem({ entry }: LogEntryItemProps) {
  const [snippetOpen, setSnippetOpen] = useState(false);

  return (
    <div
      className={`log-entry category-${entry.category}`}
      data-testid={`log-entry-${entry.id}`}
    >
      <div className="log-entry-header">
        <span className="log-entry-icon">
          {getCategoryIcon(entry.category)}
        </span>
        <span className="log-entry-timestamp">
          {formatTimestamp(entry.timestamp)}
        </span>
        <span className={`log-entry-category ${entry.category}`}>
          [{entry.category}]
        </span>
      </div>
      <div className="log-entry-message">{entry.message}</div>
      {entry.codeSnippet && (
        <div className="log-entry-snippet">
          <button
            className="snippet-toggle"
            onClick={() => setSnippetOpen(!snippetOpen)}
            data-testid={`snippet-toggle-${entry.id}`}
          >
            {snippetOpen ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            {snippetOpen ? 'Hide' : 'View'} Code Snippet
          </button>
          {snippetOpen && (
            <pre className="snippet-code" data-testid={`snippet-code-${entry.id}`}>
              {entry.codeSnippet}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
