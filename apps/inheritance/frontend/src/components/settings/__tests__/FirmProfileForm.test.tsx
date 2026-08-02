/**
 * FirmProfileForm — the Roll of Attorneys field.
 *
 * Provenance: `.planning/phases/23-.../23-RESEARCH.md` §2 measured that
 * `user_profiles` held four of the five identifiers an attribution block
 * states, and that the missing one was the Roll of Attorneys number.
 * Migration 016 added it as a column of its own rather than re-pointing
 * `ibp_roll_no`, because re-pointing would change what an already-stored
 * value denotes without anyone re-entering it.
 *
 * These cases assert the two fields are visibly distinct on the form and that
 * each writes its own key, so a crossed binding fails rather than passing by
 * coincidence.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FirmProfileForm } from '../FirmProfileForm';
import { defaultFirmProfile } from '@/lib/firm-profile';

describe('FirmProfileForm > attorney identifiers', () => {
  it('renders a Roll of Attorneys No. field bound to rollOfAttorneysNo', () => {
    render(<FirmProfileForm profile={defaultFirmProfile()} onSave={vi.fn()} />);

    const input = screen.getByLabelText('Roll of Attorneys No.');
    fireEvent.change(input, { target: { value: 'R-000001' } });

    expect((screen.getByLabelText('Roll of Attorneys No.') as HTMLInputElement).value).toBe(
      'R-000001',
    );
    // The IBP field is untouched by typing into the Roll of Attorneys field.
    expect((screen.getByLabelText('IBP Roll No.') as HTMLInputElement).value).toBe('');
  });

  it('still renders the IBP Roll No. field alongside it, with its own value', () => {
    render(
      <FirmProfileForm
        profile={{ ...defaultFirmProfile(), rollOfAttorneysNo: 'R-000001', ibpRollNo: 'IBP-000002' }}
        onSave={vi.fn()}
      />,
    );

    expect((screen.getByLabelText('Roll of Attorneys No.') as HTMLInputElement).value).toBe(
      'R-000001',
    );
    expect((screen.getByLabelText('IBP Roll No.') as HTMLInputElement).value).toBe('IBP-000002');
  });

  it('submits the Roll of Attorneys value under its own key', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<FirmProfileForm profile={defaultFirmProfile()} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText('Roll of Attorneys No.'), {
      target: { value: 'R-000001' },
    });
    fireEvent.submit(screen.getByTestId('firm-profile-form'));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0]![0]).toMatchObject({
      rollOfAttorneysNo: 'R-000001',
      ibpRollNo: null,
    });
  });
});
