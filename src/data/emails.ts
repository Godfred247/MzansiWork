export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

const org = 'Karoo Digital (Pty) Ltd';

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'employee-invite',
    name: 'Employee invitation',
    subject: `You’re invited to ${org} on MzansiWork`,
    body: `Hello,\n\nLerato Mokoena has invited you to join ${org} on MzansiWork as an employee.\n\nAccept the invitation to set your password and clock in. This link expires in 7 days and reserves one subscription seat until then.\n\nMzansiWork will never ask for your password in an email.`
  },
  {
    id: 'invite-reminder',
    name: 'Invitation reminder',
    subject: 'Your MzansiWork invitation is still waiting',
    body: `Hello,\n\nYour invitation to ${org} expires soon. Open the original link to accept it. If it expires, the reserved seat is released and your employer can send a new invitation.`
  },
  {
    id: 'invite-expired',
    name: 'Invitation expired',
    subject: 'Your MzansiWork invitation has expired',
    body: `Hello,\n\nThe invitation to ${org} has expired and no longer reserves a seat. Ask your employer to send a new one if you still need access.`
  },
  {
    id: 'password-reset',
    name: 'Password reset',
    subject: 'Reset your MzansiWork password',
    body: 'Hello,\n\nWe received a request to reset your password. The link is valid for 30 minutes and can only be used once. If you did not ask for this, you can ignore the email. We never include your current password.'
  },
  {
    id: 'leave-submitted',
    name: 'Leave submitted',
    subject: 'Leave request submitted',
    body: 'Hello,\n\nYour leave request has been sent for review. It stays pending until a manager approves or rejects it. Weekends and configured public holidays are not counted as working days.'
  },
  {
    id: 'leave-decision',
    name: 'Leave decision',
    subject: 'Update on your leave request',
    body: 'Hello,\n\nA manager has decided your leave request. Open My Leave to read the outcome and any reason. A rejection always includes a reason.'
  },
  {
    id: 'correction-submitted',
    name: 'Correction submitted',
    subject: 'Timesheet correction submitted',
    body: 'Hello,\n\nYour explanation has been sent for review. The original recorded time stays on the timeline until a manager decides. An idle observation is not treated as proof that you were not working.'
  },
  {
    id: 'correction-decision',
    name: 'Correction decision',
    subject: 'Update on your timesheet correction',
    body: 'Hello,\n\nA manager has decided your correction request. The original observation remains in the audit history even when the timesheet is updated.'
  },
  {
    id: 'more-info',
    name: 'More information requested',
    subject: 'Your manager needs a bit more detail',
    body: 'Hello,\n\nYour request is still open. A manager has asked for more information before they can decide. Reply in MzansiWork. Nothing has been approved or rejected yet.'
  },
  {
    id: 'timesheet-reminder',
    name: 'Timesheet reminder',
    subject: 'Timesheet reminder',
    body: 'Hello,\n\nPlease review this week’s timesheet before the submission deadline in your organisation’s tracking policy. Unexplained intervals do not block you from clocking out.'
  },
  {
    id: 'renewal',
    name: 'Subscription renewal',
    subject: 'Your MzansiWork subscription will renew',
    body: 'Hello,\n\nYour paid plan renews on the date shown in Subscription. The price and billing frequency stay the same unless you confirm a change. There is no automatic upgrade.'
  },
  {
    id: 'payment-failed',
    name: 'Failed payment',
    subject: 'We could not collect your MzansiWork payment',
    body: 'Hello,\n\nThe renewal payment was declined. Update the payment method and retry during the grace period. We will not charge a different amount or switch your billing frequency.'
  },
  {
    id: 'plan-change',
    name: 'Plan change confirmation',
    subject: 'You confirmed a MzansiWork plan change',
    body: 'Hello,\n\nThis email confirms the plan, price, and effective date you approved. If you did not confirm this change, contact support immediately. MzansiWork does not change plans on its own.'
  },
  {
    id: 'cancellation',
    name: 'Subscription cancellation',
    subject: 'Your MzansiWork cancellation is scheduled',
    body: 'Hello,\n\nAccess continues until the end of the period you have already paid for. The subscription will not renew after that date. Export your records before access ends if you need a copy.'
  }
];

export function invitationEmail(email: string, role: string, department: string): EmailTemplate {
  return {
    id: 'employee-invite',
    name: 'Employee invitation',
    subject: `You’re invited to ${org} on MzansiWork`,
    body: `To: ${email}\nFrom: MzansiWork <noreply@mzansiwork.co.za>\n\nHello,\n\nLerato Mokoena has invited you to join ${org} as a ${role} in ${department}.\n\nAccept within 7 days: https://app.mzansiwork.co.za/invite/demo\n\nThis invitation reserves one seat. It does not create a separate subscription for you. Employees never pay for their own MzansiWork seat.\n\nThis message is queued for SendGrid. No mailbox was contacted from this browser.`
  };
}
