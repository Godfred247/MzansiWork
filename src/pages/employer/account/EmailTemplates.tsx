import { useState } from 'react';
import { MobileHeader } from '../../../components/employer/MobileHeader';
import { MSection } from '../../../components/employer/MSection';
import { ScreenBody } from '../../../components/employer/ScreenBody';
import { SelectInput } from '../../../components/shared/SelectInput';
import { emailTemplates } from '../../../data/emails';

export function EmailTemplates() {
  const [selected, setSelected] = useState(emailTemplates[0].id);
  const email = emailTemplates.find((item) => item.id === selected) ?? emailTemplates[0];

  return (
    <>
      <MobileHeader title="Email templates" subtitle="SendGrid delivers these. SMS is not used." />
      <ScreenBody>
        <SelectInput aria-label="Email template" value={selected} onChange={(event) => setSelected(event.target.value)} options={emailTemplates.map((item) => ({ value: item.id, label: item.name }))} />
        <MSection title={email.subject} footer="Provider credentials stay on the server. They are never shown in the product.">
          <pre className="whitespace-pre-wrap px-4 py-3 text-[13px] leading-relaxed text-ink">{email.body}</pre>
        </MSection>
      </ScreenBody>
    </>);
}
