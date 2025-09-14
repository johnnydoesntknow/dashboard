export const ORIGIN_NFT_ABI = [
  "function mint(string memory referralCode) external",
  "function addressToTokenId(address user) external view returns (uint256)",
  "function getNFTData(uint256 tokenId) external view returns (string, string, uint32, string, uint256)",
  "function getUserBadges(address user) external view returns (uint256[] memory, uint256[] memory)",
  "function getReferralCode(address user) external view returns (string memory)",
  "function totalSupply() external view returns (uint256)"

];

export const REP_MANAGER_ABI = [
  "function users(address user) external view returns (uint256, uint256, uint256, uint32, uint32, uint256, string memory, address, uint256, uint256, bool, bool)",
  "function linkDiscord(address wallet, string memory discordId) external",
  "function creditRep(address user, uint256 amount, string memory reason) external",
  "function completeTask(uint256 taskId, bytes calldata data) external",
  "function registerReferral(address referred, address referrer) external"
];

export const BADGE_MANAGER_ABI = [
  "function purchaseBadge(uint256 badgeId, uint256 amount) external",
  "function getBadgeInfo(uint256 badgeId) external view returns (string, string, uint8, uint256, uint256, uint256, bool, bool)",
  "function badges(uint256 badgeId) external view returns (string, string, uint8, uint256, uint256, uint256, uint256, bool, bool, bool, uint32)"
];

export const MARKETPLACE_ABI = [
  "function listBadge(uint256 badgeId, uint256 amount, uint256 pricePerItem) external",
  "function buyBadge(uint256 listingId, uint256 amount) external",
  "function delistBadge(uint256 listingId) external",
  "function getUserActiveListings(address user) external view returns (uint256[] memory)"
];

// Read from environment variables
export const CONTRACT_ADDRESSES = {
  originNFT: process.env.NEXT_PUBLIC_ORIGIN_NFT_ADDRESS,
  repManager: process.env.NEXT_PUBLIC_REP_MANAGER_ADDRESS,
  badgeManager: process.env.NEXT_PUBLIC_BADGE_MANAGER_ADDRESS,
  marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS
};