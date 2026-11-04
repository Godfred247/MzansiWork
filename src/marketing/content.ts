export interface Qa {
  q: string;
  a: string;
}

export interface Story {
  path: string;
  kind: 'feature' | 'solution' | 'industry';
  title: string;
  lede: string;
  problem: string;
  points: { title: string; body: string }[];
  steps: { title: string; body: string }[];
  employer: string[];
  employee: string[];
  faqs: Qa[];
  related: { to: string; label: string }[];
  note?: string;
}

export const productGroups = [
  {
    heading: 'Time and attendance',
    items: [
      { to: '/product/time-tracking', label: 'Employee time tracking' },
      { to: '/product/time-tracking', label: 'Clock in and clock out' },
      { to: '/product/attendance', label: 'Attendance management' },
      { to: '/product/break-management', label: 'Break management' },
      { to: '/product/timesheets', label: 'Timesheets' },
      { to: '/product/time-tracking', label: 'Work schedules' }
    ]
  },
  {
    heading: 'Workforce management',
    items: [
      { to: '/product/employee-management', label: 'Employee management' },
      { to: '/product/leave-management', label: 'Leave management' },
      { to: '/product/time-tracking', label: 'Tasks and projects' },
      { to: '/product/employee-management', label: 'Employee invitations' },
      { to: '/product/employee-management', label: 'Role-based permissions' }
    ]
  },
  {
    heading: 'Activity and transparency',
    items: [
      { to: '/product/desktop-agent', label: 'Desktop agent' },
      { to: '/product/desktop-agent', label: 'Activity and inactivity' },
      { to: '/product/corrections', label: 'Time corrections' },
      { to: '/product/corrections', label: 'Approval workflows' },
      { to: '/tracking-policy', label: 'Tracking policies' }
    ]
  },
  {
    heading: 'Reporting and administration',
    items: [
      { to: '/product/reporting', label: 'Workforce reports' },
      { to: '/product/attendance', label: 'Attendance reports' },
      { to: '/product/timesheets', label: 'Timesheet exports' },
      { to: '/product/subscriptions', label: 'Subscription management' },
      { to: '/product/employee-management', label: 'Team administration' }
    ]
  }
];

export const solutionLinks = [
  { to: '/solutions/time-tracking', label: 'Time tracking', note: 'Record the start and end of the day.' },
  { to: '/solutions/attendance', label: 'Employee attendance', note: 'See who is in, out, or still to review.' },
  { to: '/solutions/remote-workforce', label: 'Remote workforce', note: 'The same records away from the office.' },
  { to: '/solutions/hybrid-teams', label: 'Hybrid teams', note: 'Office and remote people on one platform.' },
  { to: '/solutions/timesheets', label: 'Timesheet management', note: 'Review, correct, and export hours.' },
  { to: '/solutions/leave', label: 'Leave administration', note: 'Requests your organisation configures.' },
  { to: '/solutions/reporting', label: 'Workforce reporting', note: 'Attendance, hours, and exceptions.' },
  { to: '/solutions/accountability', label: 'Employee accountability', note: 'Clear records, not covert monitoring.' }
];

export const industryLinks = [
  { to: '/industries/small-business', label: 'Small businesses', note: 'A simple paid plan for a small team.' },
  { to: '/industries/professional-services', label: 'Professional services', note: 'Time across clients and tasks.' },
  { to: '/industries/construction', label: 'Construction and contractors', note: 'Attendance for the people you employ.' },
  { to: '/industries/logistics', label: 'Logistics and operations', note: 'Shifts and branches you configure.' },
  { to: '/industries/retail', label: 'Retail and customer services', note: 'Who was in, and when.' },
  { to: '/industries/cleaning', label: 'Cleaning and maintenance', note: 'Teams moving between sites.' },
  { to: '/industries/remote', label: 'Remote teams', note: 'Browser clock-in, optional desktop agent.' },
  { to: '/industries/growing-smes', label: 'Growing SMEs', note: 'From a handful of people to a larger team.' }
];

export const resourceLinks = [
  { to: '/help', label: 'Help centre', note: 'Search public answers.' },
  { to: '/resources/guides', label: 'Getting started', note: 'From organisation to first clock-in.' },
  { to: '/resources/guides', label: 'Product guides', note: 'How the three apps fit together.' },
  { to: '/faq', label: 'Frequently asked questions', note: 'Plans, seats, and tracking.' },
  { to: '/resources/blog', label: 'Blog and insights', note: 'Practical notes, not customer claims.' },
  { to: '/resources/guides', label: 'Time and attendance guides', note: 'How to introduce fair records.' },
  { to: '/resources', label: 'South African business resources', note: 'Rand pricing and local context.' },
  { to: '/contact', label: 'Contact support', note: 'Questions before you subscribe.' }
];

export const homeFaqs: Qa[] = [
  { q: 'What is MzansiWork?', a: 'MzansiWork is paid workforce software for attendance, working hours, timesheets, leave, and reporting. Employers use a mobile app. Employees use a browser. An optional Windows agent can record whether a computer is active or idle.' },
  { q: 'Who is MzansiWork designed for?', a: 'South African businesses that need a clearer record of who worked, from a team of five to a much larger organisation. It is not a payroll product and it does not give legal advice.' },
  { q: 'Does MzansiWork have a free plan?', a: 'No. Every organisation is on a paid subscription. There is no permanent free plan.' },
  { q: 'How does employee registration work?', a: 'The owner creates the organisation and invites people by email. An invitation reserves a seat until it is accepted, cancelled, or expires. The employee sets a password from that invitation.' },
  { q: 'Do employees pay separately?', a: 'No. The organisation pays for the seats. An employee does not buy their own subscription.' },
  { q: 'Does MzansiWork support remote employees?', a: 'Yes. Employees clock in from the browser wherever they work. The Windows agent is optional and only observes active and idle time on that computer.' },
  { q: 'What does the Windows desktop agent do?', a: 'While someone is signed in and tracking is on, it notes when the computer becomes idle and active again. It does not read keystrokes, take screenshots, or use the webcam or microphone.' },
  { q: 'Does the desktop agent take screenshots?', a: 'No. MzansiWork does not capture screens, keystrokes, private messages, or the camera.' },
  { q: 'How does inactivity detection work?', a: 'The agent records an operating-system idle or active transition. That observation is not proof that work did not happen. The employee can explain it, and a manager decides.' },
  { q: 'Can employees explain recorded inactivity?', a: 'Yes. They submit a correction. The original time stays in the record, and the decision is kept beside it.' },
  { q: 'Can I manage my workforce from my phone?', a: 'The employer app is the mobile place for attendance, approvals, leave, people, and the subscription. Employees use the browser.' },
  { q: 'Does MzansiWork support annual subscriptions?', a: 'Annual billing is available for plans of 6 or more people, at 10% off. Starter is monthly only.' },
  { q: 'Can I change my subscription?', a: 'Yes, and only after someone with billing access confirms the change. Nothing upgrades, downgrades, or switches frequency on its own.' },
  { q: 'What happens when I reach my employee limit?', a: 'You cannot invite another person until a seat is free or you confirm a larger plan. MzansiWork does not remove people or cancel invitations to force a fit.' }
];

export const stories: Story[] = [
  {
    path: '/product/time-tracking',
    kind: 'feature',
    title: 'Employee time tracking',
    lede: 'Employees record when the workday starts and ends, which task they are on, and the breaks in between.',
    problem: 'A notebook, a WhatsApp message, or a spreadsheet at the end of the week leaves the business guessing. People forget a clock-out. Hours get reconstructed from memory.',
    points: [
      { title: 'Clock in and clock out', body: 'A work session has a start and, when the day ends, an end. The original times stay even if a correction is approved later.' },
      { title: 'Tasks and projects', body: 'While clocked in, an employee can point the session at a task or a general category the organisation has set up.' },
      { title: 'Their own timesheet', body: 'Each person can see their own hours. They cannot see colleagues’ private records or the organisation’s billing.' }
    ],
    steps: [
      { title: 'Open the browser', body: 'The employee signs in with the work email on the invitation.' },
      { title: 'Start the day', body: 'Clock in, and choose the work if the organisation uses tasks.' },
      { title: 'Close the day', body: 'Clock out. The session is there for the employee and for the employer to review.' }
    ],
    employer: ['See who has started and who has not.', 'Keep a record that does not depend on a Friday spreadsheet.'],
    employee: ['One place to start, pause, and end the day.', 'Your own hours, visible to you.'],
    faqs: [
      { q: 'Can someone clock in twice by mistake?', a: 'The employee app is built to avoid a second open session. Signing in again does not invent a new clock-in.' },
      { q: 'Does clock-in require the desktop agent?', a: 'No. The browser is enough. The Windows agent is optional.' }
    ],
    related: [
      { to: '/product/attendance', label: 'Attendance' },
      { to: '/product/timesheets', label: 'Timesheets' },
      { to: '/product/employee-app', label: 'Employee browser' }
    ]
  },
  {
    path: '/product/attendance',
    kind: 'feature',
    title: 'Attendance management',
    lede: 'Employers see who is working, on a break, clocked out, or not yet in.',
    problem: 'Calling around a branch, or waiting for a supervisor to text a list, is slow. Late starts and missing clock-outs get lost.',
    points: [
      { title: 'A live view', body: 'The employer app shows the day’s attendance for the people in the organisation.' },
      { title: 'Exceptions', body: 'A missing clock-out or a start after the scheduled time can be flagged for review. A flag is a prompt, not a finding of misconduct.' },
      { title: 'Branches you choose', body: 'Filter by the branches you actually create. MzansiWork does not assume a city for you.' }
    ],
    steps: [
      { title: 'Set the schedule', body: 'Standard hours and the working week are part of organisation setup. Africa/Johannesburg is the default time zone.' },
      { title: 'Watch the day', body: 'The mobile dashboard shows who is in and who still needs attention.' },
      { title: 'Open a person', body: 'Go from the list into that person’s day when you need the detail.' }
    ],
    employer: ['A phone-sized view of the team.', 'Exceptions you can open, not a pile of paper.'],
    employee: ['Your status is the record you created.', 'A late start is visible, and it can be explained.'],
    faqs: [
      { q: 'Does attendance mean someone was productive?', a: 'No. It shows clock status and, if the agent is used, computer idle and active times. It is not a judgement of the quality of the work.' }
    ],
    related: [
      { to: '/product/time-tracking', label: 'Time tracking' },
      { to: '/product/employer-app', label: 'Employer app' },
      { to: '/solutions/attendance', label: 'Attendance solution' }
    ]
  },
  {
    path: '/product/timesheets',
    kind: 'feature',
    title: 'Timesheet management',
    lede: 'Daily, weekly, and monthly hours, with breaks and corrections kept in the same record.',
    problem: 'Timesheets that are typed up after the fact disagree with what happened. Approvals happen in email and then disappear.',
    points: [
      { title: 'Built from sessions', body: 'Hours come from clock-in, breaks, and clock-out, not from a blank form.' },
      { title: 'Corrections sit beside the original', body: 'An approved change does not erase the time that was first recorded.' },
      { title: 'Exports', body: 'Reports can be downloaded as CSV, Excel-compatible, or PDF files for the person who prepares payroll. MzansiWork does not calculate statutory pay.' }
    ],
    steps: [
      { title: 'The day is recorded', body: 'Sessions and breaks land on the employee’s timesheet.' },
      { title: 'Review', body: 'The employee can submit an explanation. A manager approves or declines it.' },
      { title: 'Export', body: 'Use the report when you need a file, and keep the audit trail in MzansiWork.' }
    ],
    employer: ['Hours you can trace back to a session.', 'An export for payroll preparation, not a payroll run.'],
    employee: ['See the week before someone else summarises it.', 'Ask for a correction without losing the original time.'],
    faqs: [
      { q: 'Is a timesheet a payslip?', a: 'No. It is a working-time record. Pay, overtime rules, and statutory calculations stay with your payroll process.' }
    ],
    related: [
      { to: '/product/corrections', label: 'Corrections' },
      { to: '/product/reporting', label: 'Reporting' },
      { to: '/solutions/timesheets', label: 'Timesheet administration' }
    ]
  },
  {
    path: '/product/break-management',
    kind: 'feature',
    title: 'Break management',
    lede: 'Record when a break starts and ends, using the categories your organisation chooses.',
    problem: 'Unrecorded lunch breaks make a day look longer than it was. A forgotten break is then argued about at month end.',
    points: [
      { title: 'Categories you name', body: 'Tea, lunch, or another break type is configured by the employer. The product does not declare what the law requires.' },
      { title: 'Start and end', body: 'A break is an interval inside the day, with its own times.' },
      { title: 'If it was missed', body: 'A correction can add or explain a break. The decision is stored with a reason.' }
    ],
    steps: [
      { title: 'Clocked in', body: 'Breaks are taken during a work session.' },
      { title: 'Choose the break', body: 'The employee starts the category that matches the policy.' },
      { title: 'Return', body: 'Ending the break continues the work session.' }
    ],
    employer: ['Break time is visible instead of guessed.', 'Your categories, not a fixed national template.'],
    employee: ['A clear way to record the break you took.', 'A path to fix a break you forgot.'],
    faqs: [
      { q: 'Does MzansiWork decide the legal break length?', a: 'No. Break rules are your policy. Have them checked against the law that applies to your workplace.' }
    ],
    related: [
      { to: '/product/time-tracking', label: 'Time tracking' },
      { to: '/product/corrections', label: 'Corrections' }
    ]
  },
  {
    path: '/product/leave-management',
    kind: 'feature',
    title: 'Leave management',
    lede: 'Employees request leave. People with permission review it. Balances are whatever the organisation configures.',
    problem: 'Leave lives in inboxes. Nobody can see who is away next week, and a balance on a spreadsheet is easy to doubt.',
    points: [
      { title: 'Requests', body: 'An employee submits the type, the dates, and a note. Types and allowances are set by the employer.' },
      { title: 'Review', body: 'A manager can approve or decline. The outcome is kept.' },
      { title: 'Not a legal ruling', body: 'A balance in MzansiWork is not a statement of what the Basic Conditions of Employment Act, or any other law, requires. Not every person qualifies for every type.' }
    ],
    steps: [
      { title: 'Ask', body: 'The employee chooses a configured leave type and the dates.' },
      { title: 'Decide', body: 'The reviewer acts in the employer app.' },
      { title: 'See the team', body: 'Approved leave can be read against the calendar the organisation keeps.' }
    ],
    employer: ['Requests in one queue.', 'Balances you configure and can explain.'],
    employee: ['Ask without a loose email.', 'See the types your employer has set up.'],
    faqs: [
      { q: 'Will the annual leave number match the statute?', a: 'Only if your organisation enters it that way, after its own legal check. MzansiWork does not certify compliance.' }
    ],
    related: [
      { to: '/solutions/leave', label: 'Leave administration' },
      { to: '/product/employer-app', label: 'Employer app' }
    ],
    note: 'Leave figures are configuration, not legal advice.'
  },
  {
    path: '/product/employee-management',
    kind: 'feature',
    title: 'Employee management',
    lede: 'Invite people, give them a role, and keep seats honest.',
    problem: 'A shared login hides who did what. Inviting someone in a side channel means you lose count of who is actually on the plan.',
    points: [
      { title: 'Invitations', body: 'The owner invites an employee or a manager by email. A valid pending invitation reserves a seat.' },
      { title: 'Roles', body: 'Owners manage the organisation. Managers do not receive billing access unless the owner grants it. Employees see their own records.' },
      { title: 'Branches and departments', body: 'You name them. Nothing is pre-selected for a city you did not choose.' }
    ],
    steps: [
      { title: 'Create the organisation', body: 'The owner is the first seat.' },
      { title: 'Invite', body: 'Each invitation holds a seat until it is accepted, cancelled, or expires.' },
      { title: 'They join', body: 'The person sets a password. The seat becomes an active member.' }
    ],
    employer: ['A directory of who is active.', 'Seat maths you can explain: limit, minus members, minus valid invitations.'],
    employee: ['You join the organisation that invited you.', 'You do not pay for the seat.'],
    faqs: [
      { q: 'Does the owner count?', a: 'Yes. The owner is a user on the plan.' },
      { q: 'What if we are over the next plan’s limit?', a: 'A smaller plan is blocked until usage fits. People are not deactivated automatically, and invitations are not cancelled for you.' }
    ],
    related: [
      { to: '/product/subscriptions', label: 'Seats and plans' },
      { to: '/pricing', label: 'Pricing' }
    ]
  },
  {
    path: '/product/desktop-agent',
    kind: 'feature',
    title: 'Windows desktop agent',
    lede: 'An optional window that shows when the computer is active or idle, and says so openly.',
    problem: 'A clock-in alone cannot tell you that someone stepped away from the machine. Hidden monitoring creates distrust and is not what this product does.',
    points: [
      { title: 'Visible', body: 'The agent has a window and a signed-in state. It does not pretend to be something else.' },
      { title: 'Idle and active only', body: 'It records operating-system idle and active transitions during a session. It does not log keys, capture the screen, or use the webcam or microphone.' },
      { title: 'Not proof', body: 'Idle time is an observation. Work away from the keyboard can be explained and reviewed.' }
    ],
    steps: [
      { title: 'Optional install', body: 'Teams that do not want it can use the browser alone. A public installer will be listed when a release build is published.' },
      { title: 'Sign in', body: 'The person signs in through the browser. The agent window does not ask them to type a password into the desktop itself.' },
      { title: 'Sync', body: 'Observations sync when the connection allows. A dropped network should not invent events.' }
    ],
    employer: ['A narrower, declared signal than a screenshot tool.', 'Something you can explain to the team before you turn it on.'],
    employee: ['You can see that tracking is on.', 'You can explain an idle interval.'],
    faqs: [
      { q: 'Is the agent required?', a: 'No. It is optional.' },
      { q: 'Does it watch the screen?', a: 'No.' }
    ],
    related: [
      { to: '/tracking-policy', label: 'Tracking policy' },
      { to: '/product/corrections', label: 'Corrections' },
      { to: '/privacy', label: 'Privacy' }
    ],
    note: 'The agent is optional. It is not a covert monitoring tool.'
  },
  {
    path: '/product/corrections',
    kind: 'feature',
    title: 'Corrections and approvals',
    lede: 'An employee explains a disputed interval. A manager decides. Both the original time and the decision remain.',
    problem: 'Verbal fixes vanish. A timesheet that is simply overwritten cannot be defended later.',
    points: [
      { title: 'The employee asks', body: 'They describe what should change and why, from the browser or, where it applies, from the agent flow.' },
      { title: 'The manager decides', body: 'Approve or decline, with a reason. Managers do not gain billing access by reviewing time.' },
      { title: 'The audit stays', body: 'The first timestamp is kept. The approved change is added beside it.' }
    ],
    steps: [
      { title: 'Notice the interval', body: 'A missing clock-out, a forgotten break, or an idle span that was actually work.' },
      { title: 'Submit', body: 'The request waits in the employer approvals list.' },
      { title: 'Decide', body: 'The outcome is visible to the people who are allowed to see that record.' }
    ],
    employer: ['A queue instead of a chat thread.', 'A reason stored with the decision.'],
    employee: ['A formal way to disagree with a record.', 'You can see that the original event was not deleted.'],
    faqs: [
      { q: 'Can an employee approve their own correction?', a: 'No. Review sits with the employer roles you allow.' }
    ],
    related: [
      { to: '/product/timesheets', label: 'Timesheets' },
      { to: '/product/desktop-agent', label: 'Desktop agent' }
    ]
  },
  {
    path: '/product/reporting',
    kind: 'feature',
    title: 'Reporting',
    lede: 'Attendance, hours, breaks, and exceptions in a form you can read and export.',
    problem: 'Leaders ask for a number and the answer is a folder of files that do not match.',
    points: [
      { title: 'Operational reports', body: 'Daily attendance, timesheets, and exceptions are the core reports. They describe records in MzansiWork.' },
      { title: 'Exports', body: 'CSV, Excel-compatible, and PDF downloads are there for the person who needs a file.' },
      { title: 'Not payroll', body: 'An export can help prepare payroll. It does not apply tax, overtime statutes, or bargaining-council rules.' }
    ],
    steps: [
      { title: 'Choose the report', body: 'Pick the question: who worked, what hours, which exceptions.' },
      { title: 'Read it', body: 'Use the on-screen view before you download.' },
      { title: 'Export if you need a file', body: 'Keep the source record in the product.' }
    ],
    employer: ['One place to answer “who worked?”.', 'A file for the payroll person, clearly not a payslip.'],
    employee: [],
    faqs: [
      { q: 'Can every employee download the company report?', a: 'No. Reports of other people’s time sit with employer roles. Employees see their own records.' }
    ],
    related: [
      { to: '/solutions/reporting', label: 'Workforce reporting' },
      { to: '/product/timesheets', label: 'Timesheets' }
    ]
  },
  {
    path: '/product/employer-app',
    kind: 'feature',
    title: 'Employer mobile app',
    lede: 'Owners and managers run the day from a phone: attendance, people, approvals, leave, and the subscription.',
    problem: 'The person who owns a small business is not at a desk when the question arrives.',
    points: [
      { title: 'Attendance in a pocket', body: 'See who is in, on a break, or not yet clocked in.' },
      { title: 'Decisions', body: 'Open a correction or a leave request and record the outcome.' },
      { title: 'The plan', body: 'Billing stays with the owner, or with a person the owner has explicitly allowed. A manager does not receive it automatically.' }
    ],
    steps: [
      { title: 'Sign in as the employer', body: 'Use the email registered for the organisation.' },
      { title: 'Work the day', body: 'Dashboard, attendance, people, approvals.' },
      { title: 'Change a plan only on purpose', body: 'Confirm the price before anything about the subscription changes.' }
    ],
    employer: ['The operational app for the business.', 'Built for a phone, not a shrunk desktop admin site.'],
    employee: [],
    faqs: [
      { q: 'Can an employee open the employer app?', a: 'An employee account is turned away from employer sign-in and sent to the employee browser.' }
    ],
    related: [
      { to: '/product/employee-app', label: 'Employee browser' },
      { to: '/product/subscriptions', label: 'Subscriptions' }
    ]
  },
  {
    path: '/product/employee-app',
    kind: 'feature',
    title: 'Employee browser',
    lede: 'The workday lives in the browser: clock in, breaks, tasks, timesheets, corrections, and leave.',
    problem: 'Asking staff to install a heavy tool before they can clock in stops adoption. A browser is enough to start.',
    points: [
      { title: 'Their day only', body: 'An employee sees their own time, leave, and profile.' },
      { title: 'No employer billing', body: 'Plans, invoices, and other people’s private records are out of reach.' },
      { title: 'The agent is separate', body: 'Desktop observations appear when that optional agent is in use. The browser still works without it.' }
    ],
    steps: [
      { title: 'Accept the invitation', body: 'Set a password from the email the organisation sent.' },
      { title: 'Clock in', body: 'Start the day and pick the work if tasks are in use.' },
      { title: 'Review', body: 'Look at the timesheet and request a correction or leave when you need to.' }
    ],
    employer: ['People record time without a shared password.', 'You see the result in the employer app.'],
    employee: ['A straightforward day view.', 'Your records, explained in plain language.'],
    faqs: [
      { q: 'Do I need a phone app as an employee?', a: 'The employee experience is the browser. The phone app is for employers.' }
    ],
    related: [
      { to: '/product/time-tracking', label: 'Time tracking' },
      { to: '/login', label: 'Employee sign-in' }
    ]
  },
  {
    path: '/product/subscriptions',
    kind: 'feature',
    title: 'Subscriptions and seats',
    lede: 'Five paid plans. The owner counts. A pending invitation holds a seat. Nothing changes price until you confirm it.',
    problem: 'Tools that upgrade themselves, or that hide the owner outside the seat count, produce a surprise on the invoice.',
    points: [
      { title: 'Paid only', body: 'There is no free organisation. Starter is R89 a month for up to 5 people, monthly only.' },
      { title: 'Seats', body: 'Available seats are the plan limit, minus active members, minus invitations that are still valid.' },
      { title: 'Your confirmation', body: 'A larger plan, a smaller plan, or a move between monthly and annual happens only after an explicit confirm. If the team does not fit the smaller plan, the change is refused.' }
    ],
    steps: [
      { title: 'Choose a plan that fits', body: 'The range is part of the plan: 5, 6–19, 20–39, 40–99, or 100 and above.' },
      { title: 'Invite within the limit', body: 'You cannot invite past the seats you have.' },
      { title: 'Change in the open', body: 'The price is shown before you confirm. A card is not charged by this preview.' }
    ],
    employer: ['A plan you can explain to a partner or an accountant.', 'Annual billing at 10% off when the plan allows 6 or more people.'],
    employee: [],
    faqs: [
      { q: 'How is Enterprise priced?', a: 'R2.70 per user per month, and at least R270. Annual billing, where you take it, is 10% off that monthly amount and is confirmed before you commit.' }
    ],
    related: [
      { to: '/pricing', label: 'Pricing' },
      { to: '/get-started', label: 'Get started' }
    ]
  },
  {
    path: '/solutions/time-tracking',
    kind: 'solution',
    title: 'Time tracking for a real workday',
    lede: 'Replace the end-of-week reconstruction with sessions people record as they happen.',
    problem: 'Owners find out on Friday that Thursday was never written down.',
    points: [
      { title: 'As it happens', body: 'Clock-in and clock-out are the source of the hours.' },
      { title: 'Breaks included', body: 'The day can show work and breaks separately.' },
      { title: 'A correction path', body: 'Mistakes are fixed by a request, not by silently editing the past.' }
    ],
    steps: [
      { title: 'Invite the team', body: 'Each person gets their own sign-in.' },
      { title: 'They clock in', body: 'From the browser, at the office or elsewhere.' },
      { title: 'You read the result', body: 'Attendance and timesheets use the same sessions.' }
    ],
    employer: ['Hours tied to a person and a time.', 'Less chasing for a spreadsheet.'],
    employee: ['A simple start and end to the day.'],
    faqs: homeFaqs.slice(0, 1),
    related: [
      { to: '/product/time-tracking', label: 'Time tracking feature' },
      { to: '/pricing', label: 'Pricing' }
    ]
  },
  {
    path: '/solutions/attendance',
    kind: 'solution',
    title: 'Employee attendance you can open on a phone',
    lede: 'See the day as it stands: in, on a break, out, or not yet started.',
    problem: 'A branch manager and a business owner do not share one view of who arrived.',
    points: [
      { title: 'One status list', body: 'The employer dashboard is the shared picture.' },
      { title: 'Schedules you set', body: 'Standard hours are yours. A late flag uses that schedule.' },
      { title: 'Follow up fairly', body: 'An exception is a prompt to look, including at the employee’s explanation.' }
    ],
    steps: [
      { title: 'Set hours', body: 'Choose a working week and a standard day. The default zone is Africa/Johannesburg.' },
      { title: 'Let people clock in', body: 'Attendance fills from those sessions.' },
      { title: 'Review exceptions', body: 'Missing clock-outs and late starts are listed for a decision.' }
    ],
    employer: ['A morning view that is not a group chat.', 'The same list if you have one branch or several you created.'],
    employee: ['You know what “in” means because you pressed it.'],
    faqs: [],
    related: [
      { to: '/product/attendance', label: 'Attendance feature' },
      { to: '/product/employer-app', label: 'Employer app' }
    ]
  },
  {
    path: '/solutions/remote-workforce',
    kind: 'solution',
    title: 'Remote workforce management',
    lede: 'People who are not in the room still clock in through the browser. The desktop agent is there only if you choose it.',
    problem: 'Remote time is either invisible or watched in a way the team was never told about.',
    points: [
      { title: 'Browser first', body: 'Clock-in does not depend on sitting in your office.' },
      { title: 'Optional computer signal', body: 'The Windows agent adds idle and active observations, visibly.' },
      { title: 'Explain the gap', body: 'A call, a site visit, or thinking away from the keyboard can be written up as a correction.' }
    ],
    steps: [
      { title: 'Agree the rule', body: 'Tell the team what is collected before you invite them. The tracking policy page is the plain version.' },
      { title: 'They work', body: 'Sessions come from the browser.' },
      { title: 'You review', body: 'Idle time waits for an explanation. It is not an automatic deduction.' }
    ],
    employer: ['A record for people you do not see.', 'A boundary you can say out loud.'],
    employee: ['You can work away from the office and still have a timesheet.', 'You can see when the agent is in use.'],
    faqs: [
      { q: 'Do you track GPS?', a: 'No. A branch is a name the employer records. The product does not follow a person’s location.' }
    ],
    related: [
      { to: '/product/desktop-agent', label: 'Desktop agent' },
      { to: '/tracking-policy', label: 'Tracking policy' }
    ]
  },
  {
    path: '/solutions/hybrid-teams',
    kind: 'solution',
    title: 'Hybrid teams on one record',
    lede: 'Office days and home days use the same clock-in, the same timesheet, and the same approvals.',
    problem: 'Hybrid teams end up with two systems: a register at reception and a spreadsheet for the people at home.',
    points: [
      { title: 'Same employee app', body: 'The browser is the clock, wherever they sit.' },
      { title: 'Same employer app', body: 'You do not keep a separate list for remote staff.' },
      { title: 'Agent only where it helps', body: 'You can use the Windows agent for computer-based roles and skip it for others.' }
    ],
    steps: [
      { title: 'One organisation', body: 'Everyone is invited into the same account.' },
      { title: 'Name the branches you have', body: 'Office, home, or a city, if you want that label.' },
      { title: 'Review once', body: 'Corrections and leave do not depend on where the person sat.' }
    ],
    employer: ['One attendance list.', 'No second product for remote staff.'],
    employee: ['The same sign-in on an office day and a home day.'],
    faqs: [],
    related: [
      { to: '/solutions/remote-workforce', label: 'Remote teams' },
      { to: '/product/employee-app', label: 'Employee browser' }
    ]
  },
  {
    path: '/solutions/timesheets',
    kind: 'solution',
    title: 'Timesheet administration',
    lede: 'Collect the week from real sessions, let people correct it, and export when payroll needs a file.',
    problem: 'Administration time goes into chasing hours that should already exist.',
    points: [
      { title: 'Less retyping', body: 'The timesheet is the sessions.' },
      { title: 'A queue', body: 'Corrections wait for a decision instead of arriving as scattered messages.' },
      { title: 'A file at the end', body: 'Export CSV, Excel-compatible, or PDF. Label it as a time record.' }
    ],
    steps: [
      { title: 'Sessions accumulate', body: 'Each clock-in feeds the sheet.' },
      { title: 'Close the gaps', body: 'Missing clock-outs and disputed idle time are requested and decided.' },
      { title: 'Hand off a file', body: 'Your payroll tool, accountant, or bureau still does the pay run.' }
    ],
    employer: ['A month that can be explained.', 'An export that does not pretend to be a payslip.'],
    employee: ['You can check your week before it is exported.'],
    faqs: [],
    related: [
      { to: '/product/timesheets', label: 'Timesheets' },
      { to: '/product/reporting', label: 'Reporting' }
    ]
  },
  {
    path: '/solutions/leave',
    kind: 'solution',
    title: 'Leave administration',
    lede: 'A request, a decision, and a balance your organisation entered on purpose.',
    problem: 'Leave approved in passing is forgotten when the roster is drawn.',
    points: [
      { title: 'A request with dates', body: 'The employee submits what they need.' },
      { title: 'A decision with a name', body: 'Approval sits with the roles you allow.' },
      { title: 'Your categories', body: 'Annual, sick, family, or a type you add. None of these figures are a legal determination.' }
    ],
    steps: [
      { title: 'Configure types', body: 'Enter the allowances you are prepared to stand behind.' },
      { title: 'Receive requests', body: 'They appear for review in the employer app.' },
      { title: 'Look ahead', body: 'Approved leave is part of the team picture.' }
    ],
    employer: ['Fewer side agreements.', 'A balance you can point to, with the caveat that the law is checked outside the product.'],
    employee: ['You can ask, and you can see the answer.'],
    faqs: [],
    related: [
      { to: '/product/leave-management', label: 'Leave feature' }
    ],
    note: 'Do not treat a balance in the product as legal advice.'
  },
  {
    path: '/solutions/reporting',
    kind: 'solution',
    title: 'Workforce reporting',
    lede: 'Answer who worked, for how long, and which exceptions are still open.',
    problem: 'The management meeting needs a number and the source is three different files.',
    points: [
      { title: 'From the same records', body: 'Reports read attendance, timesheets, and exceptions.' },
      { title: 'Scoped', body: 'Employees do not receive the company report.' },
      { title: 'Exportable', body: 'Download when a person outside the app needs the file.' }
    ],
    steps: [
      { title: 'Keep the day clean', body: 'Reports are only as good as clock-ins and decisions.' },
      { title: 'Open the report', body: 'Choose attendance, hours, or exceptions.' },
      { title: 'Share a file if needed', body: 'CSV, Excel-compatible, or PDF.' }
    ],
    employer: ['A repeatable answer.', 'Less manual tallying.'],
    employee: [],
    faqs: [],
    related: [
      { to: '/product/reporting', label: 'Reporting feature' }
    ]
  },
  {
    path: '/solutions/accountability',
    kind: 'solution',
    title: 'Accountability without hidden monitoring',
    lede: 'A fair record is one the employee can see, explain, and trust to keep the original facts.',
    problem: 'Surveillance tools create conflict. No record at all creates arguments of a different kind.',
    points: [
      { title: 'Declared', body: 'People know they are clocking in. If the agent is on, its window shows it.' },
      { title: 'Narrow', body: 'No keystrokes, screenshots, webcam, or microphone.' },
      { title: 'Decided in the open', body: 'Corrections have a requester, a reviewer, and a kept original.' }
    ],
    steps: [
      { title: 'Publish the rule', body: 'Use the tracking policy as the explanation you give the team.' },
      { title: 'Collect only that', body: 'Sessions, breaks, leave, and optional idle observations.' },
      { title: 'Review disputes', body: 'Do not treat idle time as an automatic penalty.' }
    ],
    employer: ['A standard you can defend to the team.', 'An audit trail if a record is questioned.'],
    employee: ['You can see your own record.', 'You can challenge an interval.'],
    faqs: [],
    related: [
      { to: '/tracking-policy', label: 'Tracking policy' },
      { to: '/privacy', label: 'Privacy' }
    ]
  },
  {
    path: '/solutions/small-business',
    kind: 'solution',
    title: 'Small business workforce management',
    lede: 'Starter is R89 a month for up to five people, including you. It is enough to stop tracking hours in a notebook.',
    problem: 'The first software quote feels like it was written for a company with a human-resources department.',
    points: [
      { title: 'A small plan', body: 'Starter is monthly only, up to 5 users. You are one of them.' },
      { title: 'Invite, don’t share a password', body: 'Each person joins with their own email.' },
      { title: 'Room to move', body: 'When you pass five people, you confirm a larger plan. It does not happen by itself.' }
    ],
    steps: [
      { title: 'Create the organisation', body: 'Your name, the business, and a paid plan.' },
      { title: 'Invite the team', body: 'Only as many as the plan allows.' },
      { title: 'Use the phone and the browser', body: 'You manage. They clock in.' }
    ],
    employer: ['A price you can see before you start.', 'No free tier that expires into a surprise.'],
    employee: ['A normal sign-in, even in a five-person company.'],
    faqs: [],
    related: [
      { to: '/pricing', label: 'Pricing' },
      { to: '/industries/small-business', label: 'Small businesses' }
    ]
  },
  {
    path: '/industries/small-business',
    kind: 'industry',
    title: 'Small businesses',
    lede: 'A five-person firm still needs to know who worked. It does not need a platform that assumes a head office.',
    problem: 'The owner is also the person who writes down the hours, often after the fact.',
    points: [
      { title: 'Starter', body: 'R89 a month, up to 5 people, monthly billing.' },
      { title: 'Plain roles', body: 'You own the account. Staff clock in. You approve leave and corrections.' },
      { title: 'What it is not', body: 'It will not run your payroll, your stock, or your invoices.' }
    ],
    steps: [
      { title: 'Sign up the business', body: 'You are the first seat.' },
      { title: 'Invite up to the limit', body: 'Pending invitations count, so you cannot over-invite by accident.' },
      { title: 'Look at the day on your phone', body: 'Attendance without a separate admin hire.' }
    ],
    employer: ['Affordable relative to rebuilding a spreadsheet every Friday.', 'A path to the Small Business plan when you grow past five.'],
    employee: ['You are invited, not added under someone else’s password.'],
    faqs: [],
    related: [
      { to: '/solutions/small-business', label: 'Small business solution' },
      { to: '/pricing', label: 'Pricing' }
    ],
    note: 'This is a use case, not a claim that particular firms already use MzansiWork.'
  },
  {
    path: '/industries/professional-services',
    kind: 'industry',
    title: 'Professional services',
    lede: 'See how time sits on tasks and clients you name, and keep attendance for the people in the firm.',
    problem: 'Client work and internal time get mixed, and the timesheet is rebuilt from calendars.',
    points: [
      { title: 'Tasks', body: 'Point a session at the work the firm cares about.' },
      { title: 'The record', body: 'Hours come from clock-in, not from a reconstructed diary.' },
      { title: 'Limits', body: 'This is not a full practice-management or billing engine. It will not raise a client invoice.' }
    ],
    steps: [
      { title: 'Name the work', body: 'Projects and tasks the team can pick.' },
      { title: 'Clock to them', body: 'Employees choose while they are clocked in.' },
      { title: 'Report', body: 'Read hours by the records you have, and export if finance needs a file.' }
    ],
    employer: ['A clearer split of the week.', 'Approvals when a day needs a correction.'],
    employee: ['You can see your own time against the work you selected.'],
    faqs: [],
    related: [
      { to: '/product/time-tracking', label: 'Time tracking' },
      { to: '/product/reporting', label: 'Reporting' }
    ],
    note: 'No claim is made about existing professional-services customers.'
  },
  {
    path: '/industries/construction',
    kind: 'industry',
    title: 'Construction and contractors',
    lede: 'Keep an attendance record for the people you employ, including teams you label by project or yard.',
    problem: 'Hours for site and office staff are collected differently, and neither list is trusted at month end.',
    points: [
      { title: 'People, not a gate motor', body: 'MzansiWork does not offer biometric turnstiles, GPS geofences, or a site-photo tool.' },
      { title: 'Branches and projects you name', body: 'Use a branch or a task for the yard, the office, or a contract.' },
      { title: 'The same approvals', body: 'A missed clock-out is a correction, whether the person was in the office or on a job.' }
    ],
    steps: [
      { title: 'Invite the employed team', body: 'Each person clocks in on the browser.' },
      { title: 'Label the work', body: 'Tasks can distinguish contracts if you set them up.' },
      { title: 'Review on the phone', body: 'The owner does not have to be in the site office to see the day.' }
    ],
    employer: ['One list for employed staff.', 'No promise of field-worker hardware you do not have.'],
    employee: ['Clock in from the browser the business asks you to use.'],
    faqs: [
      { q: 'Can it clock someone in from a gate or a fingerprint reader?', a: 'No. Attendance starts when the employee clocks in.' }
    ],
    related: [
      { to: '/product/attendance', label: 'Attendance' },
      { to: '/product/employee-management', label: 'People and branches' }
    ],
    note: 'This page describes office and employed-team administration. It is not a site-access or GPS product.'
  },
  {
    path: '/industries/logistics',
    kind: 'industry',
    title: 'Logistics and operations',
    lede: 'Record attendance for dispatch, warehouse, and office teams, with the hours and branches you configure.',
    problem: 'Early shifts and late shifts get written up differently, and a missed clock-out hides a long day.',
    points: [
      { title: 'Hours you choose', body: 'Standard days can reflect an early start, a late shift, or a night pattern you select at setup.' },
      { title: 'Not fleet tracking', body: 'MzansiWork does not track vehicles, routes, or driver GPS.' },
      { title: 'Exceptions', body: 'A missing clock-out stays visible until someone deals with it.' }
    ],
    steps: [
      { title: 'Set the pattern', body: 'Pick the working week and the standard hours.' },
      { title: 'Name the branches', body: 'Depot, office, or another label you actually use.' },
      { title: 'Review exceptions', body: 'Use corrections when a shift was recorded wrongly.' }
    ],
    employer: ['Attendance for employed operations staff.', 'A clear limit on what the product will not do.'],
    employee: ['Clock in for the shift you worked.'],
    faqs: [],
    related: [
      { to: '/product/attendance', label: 'Attendance' }
    ],
    note: 'No vehicle tracking is included or implied.'
  },
  {
    path: '/industries/retail',
    kind: 'industry',
    title: 'Retail and customer services',
    lede: 'See who was in for the trading day, including later starts and weekend patterns you configure.',
    problem: 'The floor and the back office report attendance differently, and leave is agreed verbally.',
    points: [
      { title: 'The trading day', body: 'Choose standard hours that match the shop, not only a 08:00 office.' },
      { title: 'Leave in the same system', body: 'A request is better than a note on the roster.' },
      { title: 'Not a till or roster engine', body: 'MzansiWork does not build retail rosters, run POS, or schedule every 15-minute break automatically.' }
    ],
    steps: [
      { title: 'Set shop hours', body: 'The organisation’s standard day is yours.' },
      { title: 'Staff clock in', body: 'From the browser.' },
      { title: 'You check the phone', body: 'Who is in, who is on leave, who still needs a clock-out.' }
    ],
    employer: ['A daily attendance picture.', 'Leave requests instead of corridor agreements.'],
    employee: ['Your own hours for the shifts you recorded.'],
    faqs: [],
    related: [
      { to: '/product/leave-management', label: 'Leave' },
      { to: '/product/attendance', label: 'Attendance' }
    ]
  },
  {
    path: '/industries/cleaning',
    kind: 'industry',
    title: 'Cleaning and maintenance',
    lede: 'Record attendance for teams that move between sites you name, without pretending the phone is a GPS tracker.',
    problem: 'Supervisors collect paper timesheets from several sites and type them up.',
    points: [
      { title: 'Sites as labels', body: 'A branch or task can name a contract or a building. It is a label, not a location ping.' },
      { title: 'The browser', body: 'Clock-in still happens in the employee app.' },
      { title: 'Honest limits', body: 'There is no proof-of-presence photo, NFC tag, or live map.' }
    ],
    steps: [
      { title: 'Invite the crews you employ', body: 'Each person has a seat.' },
      { title: 'Name the contracts', body: 'Tasks or branches, if that helps the timesheet.' },
      { title: 'Approve the exceptions', body: 'Missed clock-outs are reviewed, not silently filled.' }
    ],
    employer: ['Less retyping of paper sheets.', 'No false promise of on-site hardware.'],
    employee: ['One sign-in for the day you worked.'],
    faqs: [],
    related: [
      { to: '/product/time-tracking', label: 'Time tracking' }
    ]
  },
  {
    path: '/industries/remote',
    kind: 'industry',
    title: 'Remote teams',
    lede: 'A distributed team uses the browser to record the day, and the Windows agent only if you want a computer-idle signal.',
    problem: 'Fully remote companies either trust nothing or install tools they cannot explain to staff.',
    points: [
      { title: 'Explainable', body: 'You can tell a new hire exactly what is collected.' },
      { title: 'Optional agent', body: 'Idle and active only, and only on Windows, and only if you deploy it.' },
      { title: 'Corrections', body: 'Work that happened away from the machine can be written into the record properly.' }
    ],
    steps: [
      { title: 'Write the policy', body: 'Share the tracking explanation before go-live.' },
      { title: 'Invite everyone', body: 'They use the browser.' },
      { title: 'Add the agent only where it belongs', body: 'Computer-based roles, with the window visible.' }
    ],
    employer: ['A remote record you can describe in one paragraph.', 'No screenshot product to apologise for.'],
    employee: ['You know when tracking is active.'],
    faqs: [],
    related: [
      { to: '/solutions/remote-workforce', label: 'Remote workforce solution' },
      { to: '/product/desktop-agent', label: 'Desktop agent' }
    ]
  },
  {
    path: '/industries/growing-smes',
    kind: 'industry',
    title: 'Growing SMEs',
    lede: 'Move from a handful of people to tens of people without an automatic jump in price.',
    problem: 'The team crosses a plan boundary and the invoice changes before anyone agreed.',
    points: [
      { title: 'Bands', body: '6–19, 20–39, and 40–99 are separate plans, with annual billing at 10% off.' },
      { title: 'You confirm', body: 'Crossing into the next plan is a decision, with the price shown first.' },
      { title: 'Enterprise when you pass 99', body: 'From R270 a month, at R2.70 per user, whichever is higher.' }
    ],
    steps: [
      { title: 'Start in the band you fit', body: 'Seats include you and valid invitations.' },
      { title: 'Hire up to the limit', body: 'The product stops a further invite rather than upgrading you.' },
      { title: 'Confirm the next plan', body: 'Only then does the price change.' }
    ],
    employer: ['Growth without a silent upgrade.', 'Annual pricing you can budget.'],
    employee: [],
    faqs: [],
    related: [
      { to: '/pricing', label: 'Pricing' },
      { to: '/product/subscriptions', label: 'Seats' }
    ]
  }
];

export interface Article {
  slug: string;
  title: string;
  category: string;
  updated: string;
  lede: string;
  sections: { heading: string; body: string }[];
}

export const articles: Article[] = [
  {
    slug: 'introduce-transparent-time-tracking',
    title: 'How to introduce time tracking without turning it into surveillance',
    category: 'Remote working',
    updated: '4 November 2026',
    lede: 'People accept a record they were told about. They reject a tool that watches in secret. This note is a way to roll out MzansiWork, not a legal opinion.',
    sections: [
      { heading: 'Say what is collected', body: 'Clock-in and clock-out, breaks, leave requests, and, only if you deploy it, computer idle and active times. Say the matching negatives: no keystrokes, no screenshots, no webcam, no microphone, no GPS.' },
      { heading: 'Say what idle time is', body: 'An idle flag means the computer did not receive input. It does not mean the person was not working. Tell the team they can explain it, and that a manager decides.' },
      { heading: 'Keep the original', body: 'If a correction is approved, the first timestamp stays. That is what makes the record usable later.' },
      { heading: 'Check the law yourself', body: 'Workplace privacy and employment rules differ. Have the rollout read by someone qualified before you rely on it. MzansiWork does not certify POPIA compliance.' }
    ]
  },
  {
    slug: 'what-counts-as-a-seat',
    title: 'What counts as a seat on a MzansiWork plan',
    category: 'Workforce management',
    updated: '4 November 2026',
    lede: 'The argument about the invoice usually starts with who is counted. The rule is short.',
    sections: [
      { heading: 'The owner counts', body: 'The person who creates the organisation is a user. A five-person Starter plan does not mean five employees plus a free owner.' },
      { heading: 'Active members count', body: 'Everyone who has joined and is still active uses a seat.' },
      { heading: 'Valid invitations count', body: 'A pending invitation that has not expired or been cancelled reserves a seat, so you cannot invite more people than the plan allows.' },
      { heading: 'Released seats', body: 'When an invitation expires or is cancelled, the seat is free again. MzansiWork will not cancel invitations for you to force a downgrade.' }
    ]
  },
  {
    slug: 'idle-time-is-an-observation',
    title: 'Idle time is an observation, not a verdict',
    category: 'Time tracking',
    updated: '4 November 2026',
    lede: 'The optional Windows agent can say that a computer went quiet. It cannot say why.',
    sections: [
      { heading: 'What the agent records', body: 'A change between active and idle at the operating system, during a session where tracking is on and the person is signed in.' },
      { heading: 'What it does not record', body: 'The content of the screen, the keys pressed, conversations, or the room through a camera or microphone.' },
      { heading: 'What should happen next', body: 'The employee can explain the interval. A manager approves or declines. Until that decision, the idle span is not treated as proof that the time was not worked.' }
    ]
  }
];

export const guides = [
  { to: '/resources/guides', title: 'How the three apps fit', body: 'Employer phone, employee browser, optional Windows agent.' },
  { to: '/product/attendance', title: 'How to manage attendance', body: 'Status, schedules, and exceptions.' },
  { to: '/solutions/timesheets', title: 'Timesheet administration', body: 'Sessions, corrections, and exports.' },
  { to: '/solutions/remote-workforce', title: 'Managing remote employees', body: 'Browser clock-in and an optional idle signal.' },
  { to: '/resources/blog/introduce-transparent-time-tracking', title: 'Introducing transparent tracking', body: 'What to tell the team before the first invite.' },
  { to: '/product/leave-management', title: 'Managing leave requests', body: 'Configured types, not a legal calculator.' },
  { to: '/pricing', title: 'Choosing a plan', body: 'Bands, seats, and the annual discount.' }
];

export function storyByPath(path: string): Story | undefined {
  return stories.find((story) => story.path === path);
}
