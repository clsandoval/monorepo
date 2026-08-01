/**
 * Subject: frontend/src/components/case/SaveStatusBadge.tsx
 *
 * Two rules are pinned here, both load-bearing beyond taste:
 *   - `idle` renders nothing at all, because five approved journey reference images capture the
 *     succession wizard on a screen nobody has typed into.
 *   - A failed save is never rendered as success. The error case asserts BOTH that the error copy is
 *     present and that the success copy is absent from the document (requirement SAVE-04).
 *
 * Following the local convention, this file builds its own fixtures and imports no shared factory.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SaveStatusBadge } from '../SaveStatusBadge';

describe('SaveStatusBadge', () => {
  it('renders nothing at idle', () => {
    const { container } = render(<SaveStatusBadge status="idle" />);
    expect(screen.queryByTestId('wizard-save-status')).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('renders the saving label', () => {
    render(<SaveStatusBadge status="saving" />);
    expect(screen.getByTestId('wizard-save-status')).toHaveTextContent('Saving...');
  });

  it('renders the saved label', () => {
    render(<SaveStatusBadge status="saved" />);
    expect(screen.getByTestId('wizard-save-status')).toHaveTextContent('Saved');
  });

  it('renders the error label', () => {
    render(<SaveStatusBadge status="error" />);
    expect(screen.getByTestId('wizard-save-status')).toHaveTextContent('Save error');
  });

  it('never renders the success copy in the error state', () => {
    render(<SaveStatusBadge status="error" />);
    expect(screen.queryByText('Saved')).toBeNull();
    expect(screen.getByTestId('wizard-save-status')).toHaveTextContent('Save error');
  });

  /*
   * The discriminator is `bg-destructive`, the destructive VARIANT's own class, not the bare
   * substring `destructive`. The shadcn Badge base class always contains
   * `aria-invalid:ring-destructive/20` and `aria-invalid:border-destructive`, so a bare-substring
   * assertion is true for every variant and can never fail — it would be a test that cannot detect
   * the defect it names. This is a stricter check, not a looser one: it also asserts the secondary
   * variant's own class is present on the saved badge.
   */
  it('marks the error state destructive', () => {
    const { unmount } = render(<SaveStatusBadge status="error" />);
    const errorClassName = screen.getByTestId('wizard-save-status').className;
    expect(errorClassName).toContain('bg-destructive');
    expect(errorClassName).not.toContain('bg-secondary');
    unmount();

    render(<SaveStatusBadge status="saved" />);
    const savedClassName = screen.getByTestId('wizard-save-status').className;
    expect(savedClassName).not.toContain('bg-destructive');
    expect(savedClassName).toContain('bg-secondary');
  });
});
