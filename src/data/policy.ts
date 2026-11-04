export const trackingPolicy = {
  name: 'Karoo Digital — Standard tracking policy',
  version: 'v3 · updated 1 Sep 2026',
  idleThresholdMin: 5,
  explanationOverMin: 15,
  retention: '36 months (configured placeholder — pending legal review)',
  submissionDeadline: 'Fridays at 17:00',
  rounding: 'No rounding',
  overtimeWarning: 'Warn above 45 hours per week (estimate only)',
  pauseAllowed: true,
  approver: 'Line manager, then Operations Manager'
};

export const collected = [
{ item: 'Clock-in, clock-out and break times', when: 'When you use the portal', visible: true },
{ item: 'Selected project, task and work category', when: 'When you choose them', visible: true },
{ item: 'Operating-system idle and active transitions (timestamps only)', when: 'Only while a work session is active and the agent is signed in', visible: true },
{ item: 'Your explanations and correction requests', when: 'When you submit them', visible: true },
{ item: 'Agent version and sync status', when: 'While the agent runs', visible: false }];


export const notCollected = [
'Keystrokes or typed content',
'Screenshots or screen recording',
'Webcam or microphone',
'Website history, private messages or passwords',
'Location'];