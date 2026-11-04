export interface SignupInvite {
  email: string;
  role: string;
  department: string;
  branch: string;
}

export interface SignupDraft {
  fullName: string;
  email: string;
  password: string;
  organisationName: string;
  contact: string;
  timezone: string;
  workingWeek: string;
  standardHours: string;
  branches: string[];
  planId: string;
  frequency: string;
  users: number;
  invites: SignupInvite[];
}

const empty: SignupDraft = {
  fullName: '',
  email: '',
  password: '',
  organisationName: '',
  contact: '',
  timezone: 'Africa/Johannesburg',
  workingWeek: 'Monday – Friday',
  standardHours: '08:00 – 17:00',
  branches: [],
  planId: 'small',
  frequency: 'monthly',
  users: 8,
  invites: []
};

let draft: SignupDraft = { ...empty };

export function updateSignupDraft(patch: Partial<SignupDraft>) {
  draft = { ...draft, ...patch };
}

export function signupDraft() {
  return draft;
}

export function clearSignupDraft() {
  draft = { ...empty };
}
