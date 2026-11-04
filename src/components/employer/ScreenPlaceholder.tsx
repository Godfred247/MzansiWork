import React from 'react';
import { HammerIcon } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { ScreenBody } from './ScreenBody';
import { EmptyState } from '../shared/EmptyState';

export function makePlaceholder(title: string): React.ComponentType {
  function Placeholder() {
    return (
      <>
        <MobileHeader title={title} />
        <ScreenBody>
          <EmptyState icon={HammerIcon} title={`${title} is in progress`} body="This screen hasn’t been built in the prototype yet." />
        </ScreenBody>
      </>);

  }
  return Placeholder;
}