import { ComponentProps } from 'react';
import { WarningBanner } from '../../components/banner/WarningBanner';

export function FormWarningBanner(props: ComponentProps<typeof WarningBanner>) {
  return <WarningBanner {...props} />;
}
