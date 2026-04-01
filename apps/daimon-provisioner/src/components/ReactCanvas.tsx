'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { transform } from 'sucrase';
import { DeploymentBrief } from '@/lib/types';

interface ReactCanvasProps {
  jsx: string | null;
  brief: DeploymentBrief;
  onBriefChange: (brief: DeploymentBrief) => void;
  onAnnotationAdd: (section: string, text: string) => void;
}

export function ReactCanvas({ jsx, brief, onBriefChange, onAnnotationAdd }: ReactCanvasProps) {
  const rendered = useMemo(() => {
    if (jsx === null) return null;

    try {
      const result = transform(jsx, {
        transforms: ['jsx'],
        jsxRuntime: 'classic',
        jsxPragma: 'React.createElement',
        jsxFragmentPragma: 'React.Fragment',
      });

      const ConfigPanel = new Function(
        'React',
        'useState',
        'useEffect',
        'useCallback',
        'useMemo',
        'useRef',
        result.code + '; return ConfigPanel;'
      )(React, useState, useEffect, useCallback, useMemo, useRef);

      return { Component: ConfigPanel, error: null };
    } catch (err) {
      return { Component: null, error: err instanceof Error ? err.message : String(err) };
    }
  }, [jsx]);

  if (jsx === null) {
    return (
      <div className="config">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <p style={{ color: '#999', fontSize: '14px' }}>
            Start a conversation to build the deployment brief.
          </p>
        </div>
      </div>
    );
  }

  if (rendered?.error) {
    return (
      <div className="config">
        <div style={{ border: '1px solid #dc2626', borderRadius: '3px', padding: '16px' }}>
          <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: '8px' }}>Error rendering panel</p>
          <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{rendered.error}</p>
          <details>
            <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#999' }}>Show raw JSX</summary>
            <pre style={{ marginTop: '8px', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#555' }}>
              {jsx}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  const ConfigPanel = rendered!.Component;

  return (
    <div className="config">
      <ConfigPanel brief={brief} onBriefChange={onBriefChange} onAnnotationAdd={onAnnotationAdd} />
    </div>
  );
}
