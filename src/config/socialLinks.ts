/**
 * Konfigurasi link resmi PepeTubes
 */
export const appLinks = {
  website: "https://pepetubes.io",
  airdrop: "https://airdrop.pepetubes.io",
  staking: "https://app.pepetubes.io",
  whitepaper: "https://pepetubes.io/whitepaper.pdf"
};

/**
 * Konfigurasi link sosial media resmi PepeTubes
 */
export const socialLinks = {
  twitter: "https://twitter.com/PepeTubes",
  telegram: "https://t.me/+3BONF0QHbr9iODU9",
  discord: "https://discord.gg/M3CcMr6NrG",
  medium: "https://medium.com/@pepetubes",
  youtube: "https://youtube.com/@PepeTubes"
};

/**
 * Konfigurasi DEX Partner
 */
export const dexPartners = {
  pancakeswap: "https://pancakeswap.finance/swap?outputCurrency=0x123pepetubes", // Ganti dengan contract address yang sebenarnya
  uniswap: "https://app.uniswap.org/#/swap?outputCurrency=0x123pepetubes", // Ganti dengan contract address yang sebenarnya
};

/**
 * Tweet template untuk share di Twitter
 */
export const tweetTemplates = {
  default: "I'm participating in the $PEPE Tubes Airdrop! Join me and earn PEPE tokens: https://airdrop.pepetubes.io #PepeTubes #Airdrop #Cryptocurrency",
  referral: (referralCode: string) => `I'm participating in the $PEPE Tubes Airdrop! Join using my referral code: ${referralCode} and earn bonus tokens: https://airdrop.pepetubes.io/?ref=${referralCode} #PepeTubes #Airdrop`
};

/**
 * Fungsi helper untuk membuka link sosial media di tab baru
 */
export const openSocialLink = (url: string): void => {
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Fungsi helper untuk membuat tweet
 */
export const shareOnTwitter = (message: string): void => {
  const encodedMessage = encodeURIComponent(message);
  // Updated to use the intent URL which still works for both twitter.com and x.com
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
  window.open(twitterShareUrl, '_blank', 'noopener,noreferrer');
};

// Add a helper function to validate Twitter/X URLs
export const isValidTwitterUrl = (url: string): boolean => {
  return url.includes('twitter.com') || url.includes('x.com');
};
