'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ConnectWalletButton } from '../../features/wallet/ConnectWalletButton';
import { RawNavConfig } from '../../lib/nav/types';
import Nav from './Nav';

interface MobileMenuProps {
  activeMobileMenu?: boolean;
  setActiveMobileMenu?: (value: boolean) => void;
  rawMenus: RawNavConfig[];
}

const PopupMobileMenu = ({ activeMobileMenu, setActiveMobileMenu, rawMenus }: MobileMenuProps) => {
  // const { open } = useAppKit();

  const handleResize = () => {
    if (window.innerWidth > 992) {
      setActiveMobileMenu?.(true);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [setActiveMobileMenu]);
  const pathname = usePathname();

  useEffect(() => {
    setActiveMobileMenu?.(true);
  }, [pathname]);

  // const { isConnected, address } = useAccount();
  // const formatAddress = (address: string): string => {
  //   if (!address) return "";
  //   return `${address.slice(0, 4)}...${address.slice(-4)}`;
  // };
  // const buttonTitle = useMemo(() => {
  //   if (!isConnected) return "connect wallet";
  //   else return formatAddress(`${address}`);
  // }, [isConnected]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const popupMenu = document.querySelector('.popup-mobile-menu.active') as HTMLElement | null;
      const innerPopup = document.querySelector('.inner-popup') as HTMLElement | null;

      if (popupMenu && popupMenu.contains(event.target as Node)) {
        if (innerPopup && innerPopup.contains(event.target as Node)) {
          // nothing here
        } else {
          setActiveMobileMenu?.(true);
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);
  // const connect = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault(); // Prevent default form submission behavior
  //   open();
  // };
  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   connect(e);
  //   setActiveMobileMenu?.(true);
  // };
  return (
    <>
      <div className={`popup-mobile-menu ${activeMobileMenu ? '' : 'active'}`}>
        <div className="bg" onClick={() => setActiveMobileMenu?.(!activeMobileMenu)}></div>
        <div className="inner-popup">
          <div className="header-top">
            {/* <DarkSwitch isLight={isLightTheme} switchTheme={toggleTheme} /> */}
            <div className="logo">
              <Link href="/">
                <Image
                  className="logo-light"
                  src="/logo.svg"
                  width={161}
                  height={35}
                  alt="ChatBot Logo"
                />
              </Link>
            </div>
            <div className="close-menu">
              <button
                className="close-button"
                onClick={() => setActiveMobileMenu?.(!activeMobileMenu)}
              >
                <i className="feather-x"></i>
              </button>
            </div>
          </div>

          <div className="content">
            <Nav rawMenus={rawMenus} />
            <div className="lcai-sm-separator"></div>
            <div className="header-btn position-static wallet-btn-ml-0">
              <Link href={'/dashboard'} className="">
                <button type="button" className="btn-default btn-border text-uppercase mb-4 w-100">
                  Dashboard
                </button>
              </Link>

              <ConnectWalletButton />
            </div>
            <ul className="social-icon social-default transparent-with-border mb--20">
              <li data-sal="slide-up" data-sal-duration="400" data-sal-delay="200">
                <Link href="https://x.com/LightchainAI">
                  <i className="fa-brands fa-twitter"></i>
                </Link>
              </li>
              <li data-sal="slide-up" data-sal-duration="400" data-sal-delay="300">
                <Link href="https://Discord.gg/lightchain">
                  <i className="fa-brands fa-discord"></i>
                </Link>
              </li>
              <li data-sal="slide-up" data-sal-duration="400" data-sal-delay="400">
                <Link href="https://linktr.ee/lightchainai" className="text-center">
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4 10h16" />
                    <path d="M6.5 4.5l11 11" />
                    <path d="M6.5 15.5l11 -11" />
                    <path d="M12 10v-8" />
                    <path d="M12 15v7" />
                  </svg>

                  {/* Assuming you're using an icon library that supports "feather-link" */}
                </Link>
              </li>
              {/* <li
                data-sal="slide-up"
                data-sal-duration="400"
                data-sal-delay="500"
              >
                <Link href="/blogs">
                  <i className="fa-brands fa-medium"></i>
              
                </Link>
              </li> */}
            </ul>{' '}
          </div>
        </div>
      </div>
    </>
  );
};

export default PopupMobileMenu;
