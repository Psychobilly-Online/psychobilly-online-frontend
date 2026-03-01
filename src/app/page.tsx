import { Metadata } from 'next';
import { Startpage } from '@/components/pages/Startpage';

export const metadata: Metadata = {
  title: 'Psychobilly Online: The Relaunch',
  description:
    'Rebuilding the independent psychobilly community platform from scratch. Event database, band directory, forums, and user pages - from fans, for fans.',
};

export default function Home() {
  return <Startpage />;
}
