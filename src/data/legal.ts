export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalDocument {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

/** Product notices for this build. They are not a legal opinion or a compliance certificate. */
export const legal: Record<'privacy' | 'terms', LegalDocument> = {
  privacy: {
    title: 'Privacy notice',
    updated: '3 November 2026',
    intro: 'This notice explains what MzansiWork stores so an organisation can run time, attendance and leave. It is written for teams in Southern Africa. It is not a legal opinion, and each organisation should review it against the privacy law that applies to them — including South Africa’s Protection of Personal Information Act where that law applies.',
    sections: [
      {
        heading: 'Who handles the information',
        body: 'The employer organisation decides why workforce records are kept. MzansiWork processes those records to provide the service. Questions about this notice can go to support@mzansiwork.co.za.'
      },
      {
        heading: 'What we store',
        body: 'Account name and work email, a password hash, the organisation and its plan, branches the employer records, clock-in and clock-out times, breaks, leave requests, corrections, invitation emails, and active or idle signals from the Windows agent.'
      },
      {
        heading: 'What we do not collect',
        body: 'No keystrokes, screenshots, webcam, or microphone. The agent does not read the content of other programs. A branch name is the place the employer records — the product does not track a person’s GPS.'
      },
      {
        heading: 'Idle time',
        body: 'Idle time is an observation from the computer. It is not proof that someone was not working. A correction keeps the original timestamp and adds the approved change beside it.'
      },
      {
        heading: 'Who can see a record',
        body: 'An employee can see their own time, leave and profile. An owner or a person the owner has allowed can see the team’s records and, where billing is granted, the subscription. Employees cannot see other people’s private records or the organisation’s billing.'
      },
      {
        heading: 'How long it is kept',
        body: 'The employer chooses a retention period in settings. Any period shown in the product is a configuration, not a statutory retention period.'
      }
    ]
  },
  terms: {
    title: 'Terms of service',
    updated: '3 November 2026',
    intro: 'These terms describe how an organisation uses MzansiWork. They are the product rules for this build and should be reviewed by a lawyer before they are relied on in a contract.',
    sections: [
      {
        heading: 'The customer',
        body: 'The organisation that creates the account is the customer. People invited as employees or managers use the service under that organisation. There is no free plan.'
      },
      {
        heading: 'Seats',
        body: 'The owner counts as a seat. A pending invitation reserves a seat until it is accepted, cancelled, or expires. Available seats are the plan limit, minus active members, minus invitations that are still valid. MzansiWork does not remove people or cancel invitations to make a smaller plan fit.'
      },
      {
        heading: 'Plans and prices',
        body: 'Prices are in South African rand and are the published prices for this product. A plan or price change happens only after someone with billing access confirms it. Nothing upgrades, downgrades, or switches between monthly and annual on its own. Annual billing is available for plans of 6 or more people, at 10% off. Starter is monthly only.'
      },
      {
        heading: 'Time and leave',
        body: 'Leave types and balances are set by the employer. A balance in the product is not a statement of what the law requires, and not every person qualifies for every type. Idle time remains an observation, not a finding that work was not done.'
      },
      {
        heading: 'Fair tracking',
        body: 'The Windows agent may record whether the computer is active or idle, and it syncs that observation openly. It does not log keys, take screenshots, or use the webcam or microphone. Employees can read the tracking policy their organisation publishes.'
      }
    ]
  }
};
