import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ConnectWalletButton } from '../../features/wallet/ConnectWalletButton';
import { RawNavConfig } from '../../lib/nav/types';
import Nav from './Nav';
import PopupMobileMenu from './PopupMobileMenu';

interface HeaderProps {
  headerTransparent?: string;
  headerSticky?: string;
  btnClass?: string;
  rawMenus: RawNavConfig[];
}

export function Header(props: HeaderProps) {
  const { rawMenus } = props;
  const [activeMobileMenu, setActiveMobileMenu] = useState(true);
  return (
    <>
      <header className="lightchain-header header-default header-not-transparent header-sticky relative z-10 w-full px-2 py-3 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="hpl-header-logo flex items-center">
            <Image src="/logo.svg" width={250} height={50} alt="logo" />
          </Link>
          <nav className="mainmenu-nav d-md-to-xl-block link-hover ms-md-to-xl-0 hidden lg:block">
            <Nav rawMenus={rawMenus} />
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-2 md:flex-row-reverse md:items-start">
              <ConnectWalletButton />
            </div>
            <div className="mobile-menu-bar d-md-to-xl-none block lg:hidden">
              <div className="hamberger">
                <button
                  type="button"
                  className="hamberger-button"
                  onClick={() => setActiveMobileMenu(!activeMobileMenu)}
                >
                  <i className="feather-menu"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <PopupMobileMenu
        activeMobileMenu={activeMobileMenu}
        setActiveMobileMenu={setActiveMobileMenu}
        rawMenus={rawMenus}
      />
    </>
  );
}
