import { fetchNavConfig } from '../../lib/nav/fetchNavConfig';
import { Header } from './Header';

interface HeaderWrapperProps {
  headerTransparent?: string;
  headerSticky?: string;
  btnClass?: string;
}

export default async function HeaderWrapper(props: HeaderWrapperProps) {
  const rawMenus = await fetchNavConfig();
  return <Header {...props} rawMenus={rawMenus} />;
}
