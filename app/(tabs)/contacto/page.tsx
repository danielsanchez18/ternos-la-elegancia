import { Title } from '@/components/customer/contact/Title';
import { Location } from '../../../components/customer/contact/Location';
import { OurStore } from '@/components/customer/contact/OurStore';

export default function CustomerContact() {
  return (
    <div className="min-h-dvh py-20 max-w-350 mx-auto max-xl:px-4 flex flex-col gap-y-20">
      <Title />
      <Location />
      <OurStore />
    </div>
  );
}
