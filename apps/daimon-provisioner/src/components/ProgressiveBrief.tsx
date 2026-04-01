'use client';

import { useState, useRef, useCallback } from 'react';
import { DeploymentBrief, PendingQuestion } from '@/lib/types';

interface ProgressiveBriefProps {
  brief: DeploymentBrief;
  onBriefChange: (brief: DeploymentBrief) => void;
}

const SECTION_LABELS: Record<string, string> = {
  organization: 'Organization',
  discord_setup: 'Discord Setup',
  integrations: 'Integrations',
  journeys: 'User Journeys',
  credentials: 'Credentials',
  infrastructure: 'Infrastructure',
};

const TOTAL_SECTIONS = Object.keys(SECTION_LABELS).length;

export function ProgressiveBrief({ brief, onBriefChange }: ProgressiveBriefProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [shimmeringSection, setShimmeringSection] = useState<string | null>(null);
  const briefRef = useRef(brief);
  briefRef.current = brief;

  const progress = brief.locked_sections.length / TOTAL_SECTIONS;

  const sendAnswer = useCallback(async (answer: string) => {
    if (!answer.trim() || loading) return;

    setLoading(true);
    const currentSection = brief.pending_question?.section ?? null;
    setShimmeringSection(currentSection);

    // Clear the pending question immediately
    const briefWithoutQuestion = { ...briefRef.current, pending_question: null };
    onBriefChange(briefWithoutQuestion);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: answer }],
          brief: briefWithoutQuestion,
        }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ') && eventType) {
            const data = JSON.parse(line.slice(6));

            if (eventType === 'brief') {
              briefRef.current = data.brief;
              onBriefChange(data.brief);
              setShimmeringSection(null);
            } else if (eventType === 'question') {
              const updated = { ...briefRef.current, pending_question: data.question as PendingQuestion };
              briefRef.current = updated;
              onBriefChange(updated);
              setShimmeringSection(null);
            } else if (eventType === 'section_lock') {
              const updated = {
                ...briefRef.current,
                [data.section]: data.content,
                locked_sections: [...new Set([...briefRef.current.locked_sections, data.section])],
              };
              briefRef.current = updated;
              onBriefChange(updated);
              setShimmeringSection(null);
            } else if (eventType === 'done') {
              // Finalize
            }
            eventType = '';
          }
        }
      }
    } catch {
      // On error, restore the question so the user can retry
      onBriefChange(briefRef.current);
    } finally {
      setLoading(false);
      setShimmeringSection(null);
    }
  }, [brief.pending_question, loading, onBriefChange]);

  const handleOptionClick = useCallback((label: string) => {
    sendAnswer(label);
  }, [sendAnswer]);

  const handleTextSubmit = useCallback(() => {
    if (input.trim()) {
      sendAnswer(input.trim());
      setInput('');
    }
  }, [input, sendAnswer]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  }, [handleTextSubmit]);

  // If no question and no locked sections, trigger initial question
  const needsInit = !brief.pending_question && brief.locked_sections.length === 0 && !loading;

  return (
    <div className="brief-container">
      <div className="brief">
        {/* Title + progress */}
        {brief.title ? (
          <>
            <h1 style={{ fontFamily: "'Archivo', sans-serif", fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
              {brief.title}
            </h1>
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '28px' }}>
              {brief.summary || 'Building deployment brief'} &middot; {brief.locked_sections.length} of {TOTAL_SECTIONS} sections
            </p>
          </>
        ) : (
          <p style={{ fontSize: '13px', color: '#999', marginBottom: '28px' }}>
            New deployment brief
          </p>
        )}

        <div className="brief-progress">
          <div className="brief-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Locked sections */}
        {brief.locked_sections.map(sectionKey => (
          <LockedSection key={sectionKey} sectionKey={sectionKey} brief={brief} />
        ))}

        {/* Shimmer state */}
        {shimmeringSection && (
          <div className="brief-section">
            <div className="brief-section-header">
              <span className="brief-section-label">{SECTION_LABELS[shimmeringSection] ?? shimmeringSection}</span>
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', background: '#fff8e6', color: '#b45309' }}>
                Updating
              </span>
            </div>
            <div className="brief-section-body">
              <div className="brief-shimmer-bar" />
              <div className="brief-shimmer-bar" />
              <div className="brief-shimmer-bar" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {/* Frontier + active question */}
        {brief.pending_question && !shimmeringSection && (
          <>
            {brief.locked_sections.length > 0 && (
              <div className="brief-frontier">
                <div className="brief-frontier-line" />
                <div className="brief-frontier-label">Current Question</div>
                <div className="brief-frontier-line" />
              </div>
            )}

            <div className="brief-active">
              <div className="brief-section-header">
                <span className="brief-section-label">
                  {SECTION_LABELS[brief.pending_question.section] ?? brief.pending_question.section}
                </span>
              </div>
              <div className="brief-question">
                <div className="brief-question-text">{brief.pending_question.text}</div>

                {brief.pending_question.options?.map(opt => (
                  <button
                    key={opt.key}
                    className="brief-option"
                    onClick={() => handleOptionClick(opt.label)}
                    disabled={loading}
                  >
                    <span className="brief-option-key">{opt.key}</span>
                    <div className="brief-option-content">
                      <div className="brief-option-label">{opt.label}</div>
                      {opt.description && <div className="brief-option-desc">{opt.description}</div>}
                    </div>
                  </button>
                ))}

                <div className="brief-text-input">
                  <input
                    className="brief-text-field"
                    placeholder={brief.pending_question.options ? 'Or type your own answer...' : 'Type your answer...'}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                  />
                  <button className="brief-send" onClick={handleTextSubmit} disabled={loading}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* End marker */}
        <div className="brief-end">
          <span className="brief-end-dot" />
        </div>

        {/* Init trigger — send a blank message to kick off the first question */}
        {needsInit && (
          <div className="brief-empty">
            <button
              className="brief-send"
              style={{ padding: '12px 24px', fontSize: '13px' }}
              onClick={() => sendAnswer('Start building the deployment brief.')}
            >
              Start Brief
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LockedSection({ sectionKey, brief }: { sectionKey: string; brief: DeploymentBrief }) {
  return (
    <div className="brief-section">
      <div className="brief-section-header">
        <span className="brief-section-label">{SECTION_LABELS[sectionKey] ?? sectionKey}</span>
        <span className="brief-lock-icon">🔒</span>
      </div>
      <div className="brief-section-body">
        <div className="brief-section-content">
          {sectionKey === 'organization' && brief.organization && (
            <>
              <strong>{brief.organization.company_name}</strong>
              {brief.organization.team_size && <> &middot; {brief.organization.team_size}</>}
              <br />
              {brief.organization.bot_purpose}
            </>
          )}

          {sectionKey === 'discord_setup' && brief.discord_setup && (
            <>
              <strong>Guild:</strong> <code style={{ fontFamily: "'Archivo', monospace", fontSize: '11px' }}>{brief.discord_setup.guild_id}</code>
              {brief.discord_setup.channels.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <strong>{brief.discord_setup.channels.length} channels</strong>: {brief.discord_setup.channels.join(', ')}
                </div>
              )}
            </>
          )}

          {sectionKey === 'integrations' && brief.integrations.length > 0 && (
            <>
              <div style={{ marginBottom: '4px' }}><strong>{brief.integrations.length} integrations</strong></div>
              {brief.integrations.map((intg, i) => (
                <span key={i} className="tag" style={{ display: 'inline-block', fontSize: '11px', padding: '2px 8px', background: 'rgba(0,111,255,0.06)', border: '1px solid rgba(0,111,255,0.18)', borderRadius: '3px', margin: '2px 4px 2px 0', color: '#006FFF' }}>
                  {intg.platform}
                </span>
              ))}
            </>
          )}

          {sectionKey === 'journeys' && brief.journeys.length > 0 && (
            <>
              <div style={{ marginBottom: '4px' }}><strong>{brief.journeys.length} user journeys</strong></div>
              {brief.journeys.map((j, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                  &bull; {j.title}
                </div>
              ))}
            </>
          )}

          {sectionKey === 'credentials' && brief.credentials.length > 0 && (
            <>
              {brief.credentials.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: i < brief.credentials.length - 1 ? '1px solid #f0ede6' : 'none' }}>
                  <code style={{ fontFamily: "'Archivo', monospace", fontSize: '11px', flex: 1 }}>{c.env_var}</code>
                  <span style={{ fontSize: '11px', color: '#999' }}>{c.platform}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '2px',
                    background: c.status === 'have' ? 'rgba(22,163,74,0.06)' : c.status === 'needed' ? 'rgba(180,83,9,0.06)' : '#f5f5f0',
                    color: c.status === 'have' ? '#16a34a' : c.status === 'needed' ? '#b45309' : '#999',
                    border: `1px solid ${c.status === 'have' ? 'rgba(22,163,74,0.18)' : c.status === 'needed' ? 'rgba(180,83,9,0.18)' : '#e5e2da'}`,
                  }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </>
          )}

          {sectionKey === 'infrastructure' && brief.infrastructure && (
            <>
              <div><strong>Region:</strong> {brief.infrastructure.fly_region}</div>
              {brief.infrastructure.supabase_project && <div><strong>Supabase:</strong> {brief.infrastructure.supabase_project}</div>}
              {brief.infrastructure.langfuse_workspace && <div><strong>Langfuse:</strong> {brief.infrastructure.langfuse_workspace}</div>}
              {brief.infrastructure.e2b_template && <div><strong>E2B:</strong> {brief.infrastructure.e2b_template}</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
