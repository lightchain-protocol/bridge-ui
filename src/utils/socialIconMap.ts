import twitterIcon from '../images/icons/x-icons-2.svg';
import discordIcon from '../images/icons/discord-icon-svgrepo-com.svg';
import linktreeIcon from '../images/icons/linktree-icon.svg';
import coinmarketcapIcon from '../images/icons/market-cap-icon.svg';
import communityIcon from '../images/icons/community-icon.svg';

/** Maps iconKey → local SVG image path. Empty string = skip. */
export const socialIconMap: Record<string, string> = {
  twitter: twitterIcon.src || twitterIcon,
  discord: discordIcon.src || discordIcon,
  linktree: linktreeIcon.src || linktreeIcon,
  coinmarketcap: coinmarketcapIcon.src || coinmarketcapIcon,
  community: communityIcon.src || communityIcon,
  telegram: '',
  medium: '',
};
