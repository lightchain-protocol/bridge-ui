import communityIcon from '../images/icons/community-icon.svg';
import discordIcon from '../images/icons/discord-icon-svgrepo-com.svg';
import linktreeIcon from '../images/icons/linktree-icon.svg';
import coinmarketcapIcon from '../images/icons/market-cap-icon.svg';
import twitterIcon from '../images/icons/x-icons-2.svg';

export const socialIconMap: Record<string, string> = {
  twitter: twitterIcon.src || twitterIcon,
  discord: discordIcon.src || discordIcon,
  linktree: linktreeIcon.src || linktreeIcon,
  coinmarketcap: coinmarketcapIcon.src || coinmarketcapIcon,
  community: communityIcon.src || communityIcon,
  telegram: '',
  medium: '',
};
