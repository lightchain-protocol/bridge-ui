import { FaXTwitter } from "react-icons/fa6";
import Link from 'next/link';
import { FaTelegramPlane } from "react-icons/fa";
import { BsMedium } from "react-icons/bs";
import { PiLinktreeLogoBold } from "react-icons/pi";


export function Footer() {
  return (
    <footer className="relative text-white">
      <div className="relative bg-gradient-to-b from-transparent to-black/40 px-2 pb-2 pt-3 sm:px-6 lg:px-12 pb-5 pt-2 sm:pt-0">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-10">
        <span className="text-primary-300">Copyright © 2025 <Link className="copyright-link" href='https://lightchain.ai'>Lightchain Protocol</Link></span>
          <FooterNav />
        </div>
      </div>
    </footer>
  );
}

function FooterNav() {
  return (
    <nav className="text-md font-medium">
      <ul className="hpl-social-media">
        <li>
          <Link href="https://x.com/LightchainAI" target='_blank'><FaXTwitter /></Link>
        </li>
        <li>
          <Link href="https://t.me/LightchainProtocol" target='_blank'><FaTelegramPlane /></Link>
        </li>
        <li>
          <Link href="https://linktr.ee/lightchainai" target='_blank'><PiLinktreeLogoBold /></Link>
        </li>
        <li>
          <Link href="https://news.lightchain.ai" target='_blank'><BsMedium /></Link>
        </li>
      </ul>
    </nav>
  );
}
