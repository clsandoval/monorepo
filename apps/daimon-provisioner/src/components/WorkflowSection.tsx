'use client';

import { useState } from 'react';
import { Workflow } from '@/lib/types';

interface WorkflowSectionProps {
  workflows: Workflow[];
}

export function WorkflowSection({ workflows }: WorkflowSectionProps) {
  const [open, setOpen] = useState(false);

  if (workflows.length === 0) return null;

  return (
    <>
      <button
        className={`workflows-toggle${open ? ' open' : ''}`}
        onClick={() => setOpen(!open)}
        type="button"
      >
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 3l5 5-5 5V3z" />
        </svg>
        Sample workflows using these integrations
      </button>
      {open && (
        <div className="workflows-list">
          {workflows.map((wf, i) => (
            <div key={i} className="workflow">
              <div className="workflow-title">{wf.title}</div>
              <div className="workflow-steps">
                {wf.steps.map((step, j) => (
                  <span key={j}>
                    {j > 0 && <span className="workflow-arrow">&rarr; </span>}
                    {step.tool ? (
                      <span className="workflow-tool">{step.text}</span>
                    ) : (
                      <span className="workflow-step">{step.text}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
