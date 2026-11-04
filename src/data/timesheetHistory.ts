/** Approved October history for Thandi before the detailed demo week (hours). */
export const octoberHistory: Record<string, {hours: number;status: 'approved' | 'leave';note?: string;}> = {
  '2026-10-01': { hours: 8.1, status: 'approved' },
  '2026-10-02': { hours: 7.9, status: 'approved' },
  '2026-10-05': { hours: 8.0, status: 'approved' },
  '2026-10-06': { hours: 8.3, status: 'approved' },
  '2026-10-07': { hours: 7.8, status: 'approved' },
  '2026-10-08': { hours: 0, status: 'leave', note: 'Sick leave' },
  '2026-10-09': { hours: 8.0, status: 'approved' },
  '2026-10-12': { hours: 8.2, status: 'approved' },
  '2026-10-13': { hours: 7.6, status: 'approved' },
  '2026-10-14': { hours: 8.0, status: 'approved' },
  '2026-10-15': { hours: 8.4, status: 'approved' },
  '2026-10-16': { hours: 7.9, status: 'approved' }
};

export const weeks = [
{ id: 'w43', label: '19–25 Oct 2026', days: ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25'] },
{ id: 'w44', label: '26 Oct–1 Nov 2026', days: ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'] }];