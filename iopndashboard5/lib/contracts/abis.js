export const ORIGIN_NFT_ABI = [
  "function mint(string memory referralCode) external",
  "function addressToTokenId(address user) external view returns (uint256)",
  "function getNFTData(uint256 tokenId) external view returns (string, string, uint32, string, uint256)",
  "function getUserBadges(address user) external view returns (uint256[] memory, uint256[] memory)",
  "function getReferralCode(address user) external view returns (string memory)"
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

export const CONTRACT_ADDRESSES = {
  originNFT: "0xB70B4DAb3F51A7ED2e353f84ccFaE1e0DA69E6bE",
  repManager: "0x4dF5eCA74b41a7e5C30731c815558107a9ADd185",
  badgeManager: "0x1EA6C6547634bE2f4dc8996886C355857C587DAd",
  marketplace: "0x4cb9374a0bbb8633593F65AB8B5A03bCa926762B"
};