'use client';

import Image from 'next/image';
import Link from 'next/link';
import { resolveTarget } from '../../utils/resolveTarget';
import { socialIconMap } from '../../utils/socialIconMap';
import SingleFooter from './props/SingleFooter';
import type { RawFooterConfig } from './types/types';

type Props = {
  rawFooter: RawFooterConfig;
};

const Footer = ({ rawFooter }: Props) => {
  const toItems = (col: RawFooterConfig['columns'][number]) => [
    {
      title: col.title,
      top: col.style === 'top',
      innerItem: col.links.map((link) => ({
        text: link.text,
        link: link.href,
        targetBlank: resolveTarget(link.href, link.target) === '_blank',
      })),
    },
  ];

  const services = toItems(rawFooter.columns[0]);
  const products = toItems(rawFooter.columns[1]);
  const solutions = [...toItems(rawFooter.columns[2]), ...toItems(rawFooter.columns[3])];
  const company = [
    {
      title: 'Socials',
      top: true,
      innerItem: rawFooter.social
        .filter((s) => socialIconMap[s.iconKey])
        .map((s) => ({
          text: s.text,
          link: s.href,
          icon: socialIconMap[s.iconKey],
          targetBlank: true,
        })),
    },
  ];

  return (
    <footer className="lightchain-footer footer-style-default footer-style-3 position-relative variation-2 bg-one mt-0">
      <div className="footer-top">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            <SingleFooter data={services} />
            <SingleFooter data={products} />
            <SingleFooter data={solutions} />
            <SingleFooter data={company} />
          </div>
          <div className="separator-animated variation-2 height-1 animated-true mt_sm--20 mt--70 mb--30 mt_md--30 mb_md--20 sm--30 mb_sm--20"></div>
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="lightchain-footer-widget">
                <div className="logo inline-flex">
                  <Link href="/">
                    <Image src="/logo.svg" width={201} height={35} alt="Corporate Logo" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3">
              <p className="copyright-text mb-0">
                Copyright © {new Date().getFullYear()}
                <Link href="#" className="btn-read-more ps-2">
                  <span>Lightchain Protocol</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
