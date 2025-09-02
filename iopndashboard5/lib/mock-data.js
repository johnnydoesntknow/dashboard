export const mockUser = {
  id: "1",
  name: "User", // Generic name, will be overridden by Discord username
  email: "user@example.com",
  discordId: null, // Will be populated when Discord is connected
  walletAddress: "0x1234...5678",
  repPoints: 10000,
  badges: [
    // ... rest of the badges
    { id: "1", name: "Originator", rarity: "legendary", equipped: true },
    { id: "2", name: "Culture Catalyst", rarity: "epic", equipped: true },
    { id: "3", name: "Signal Runner", rarity: "rare", equipped: false },
  ],
  nft: {
    id: "nft_001",
    name: "Origin Genesis #1234",
    image: "/placeholder.svg",
    traits: ["Legendary", "Gaming", "Social"],
  },
}

export const mockLeaderboard = [
  { id: "1", name: "CurrentUser", totalPoints: 10000, weeklyPoints: 5, badges: 12, rank: 1, isUser: true },
  { id: "2", name: "CryptoNinja", totalPoints: 5420, weeklyPoints: 850, badges: 24, rank: 2 },
  { id: "3", name: "BlockchainBoss", totalPoints: 4980, weeklyPoints: 720, badges: 19, rank: 3 },
  { id: "4", name: "Web3Warrior", totalPoints: 4650, weeklyPoints: 680, badges: 18, rank: 4 },
  { id: "5", name: "DeFiDemon", totalPoints: 3890, weeklyPoints: 620, badges: 15, rank: 5 },
  { id: "6", name: "NFTNomad", totalPoints: 3650, weeklyPoints: 580, badges: 14, rank: 6 },
  { id: "7", name: "MetaMaster", totalPoints: 3420, weeklyPoints: 550, badges: 13, rank: 7 },
  { id: "8", name: "TokenTitan", totalPoints: 3200, weeklyPoints: 520, badges: 11, rank: 8 },
  { id: "9", name: "ChainChampion", totalPoints: 3100, weeklyPoints: 500, badges: 12, rank: 9 },
  { id: "10", name: "SmartContractor", totalPoints: 3050, weeklyPoints: 480, badges: 10, rank: 10 },
  { id: "11", name: "GasOptimizer", totalPoints: 2980, weeklyPoints: 460, badges: 11, rank: 11 },
  { id: "12", name: "StakingPro", totalPoints: 2920, weeklyPoints: 440, badges: 9, rank: 12 },
  { id: "13", name: "YieldFarmer", totalPoints: 2850, weeklyPoints: 420, badges: 10, rank: 13 },
  { id: "14", name: "LiquidityProvider", totalPoints: 2780, weeklyPoints: 400, badges: 8, rank: 14 },
  { id: "15", name: "FlashLoanExpert", totalPoints: 2720, weeklyPoints: 380, badges: 9, rank: 15 },
  { id: "16", name: "ArbitrageKing", totalPoints: 2650, weeklyPoints: 360, badges: 7, rank: 16 },
  { id: "17", name: "MEVHunter", totalPoints: 2580, weeklyPoints: 340, badges: 8, rank: 17 },
  { id: "18", name: "BridgeMaster", totalPoints: 2520, weeklyPoints: 320, badges: 6, rank: 18 },
  { id: "19", name: "LayerTwoLord", totalPoints: 2450, weeklyPoints: 300, badges: 7, rank: 19 },
  { id: "20", name: "ZKProofPro", totalPoints: 2380, weeklyPoints: 280, badges: 6, rank: 20 },
  { id: "21", name: "RollupRuler", totalPoints: 2320, weeklyPoints: 260, badges: 5, rank: 21 },
  { id: "22", name: "SidechainSage", totalPoints: 2250, weeklyPoints: 240, badges: 6, rank: 22 },
  { id: "23", name: "ConsensusKing", totalPoints: 2180, weeklyPoints: 220, badges: 4, rank: 23 },
  { id: "24", name: "ValidatorVip", totalPoints: 2120, weeklyPoints: 200, badges: 5, rank: 24 },
  { id: "25", name: "NodeOperator", totalPoints: 2050, weeklyPoints: 180, badges: 3, rank: 25 },
  { id: "26", name: "MinerMagnate", totalPoints: 1980, weeklyPoints: 160, badges: 4, rank: 26 },
  { id: "27", name: "HashratePro", totalPoints: 1920, weeklyPoints: 140, badges: 2, rank: 27 },
  { id: "28", name: "BlockBuilder", totalPoints: 1850, weeklyPoints: 120, badges: 3, rank: 28 },
  { id: "29", name: "TransactionTycoon", totalPoints: 1780, weeklyPoints: 100, badges: 1, rank: 29 },
  { id: "30", name: "GasGuru", totalPoints: 1720, weeklyPoints: 80, badges: 2, rank: 30 },
  { id: "31", name: "FeeOptimizer", totalPoints: 1650, weeklyPoints: 60, badges: 1, rank: 31 },
  { id: "32", name: "MemPoolMaster", totalPoints: 1580, weeklyPoints: 40, badges: 0, rank: 32 },
  { id: "33", name: "NonceNinja", totalPoints: 1520, weeklyPoints: 20, badges: 1, rank: 33 },
  { id: "34", name: "BytecodeExpert", totalPoints: 1450, weeklyPoints: 15, badges: 0, rank: 34 },
  { id: "35", name: "AbiDecoder", totalPoints: 1380, weeklyPoints: 10, badges: 1, rank: 35 },
  { id: "36", name: "EventListener", totalPoints: 1320, weeklyPoints: 8, badges: 0, rank: 36 },
  { id: "37", name: "LogAnalyzer", totalPoints: 1250, weeklyPoints: 6, badges: 0, rank: 37 },
  { id: "38", name: "StateReader", totalPoints: 1180, weeklyPoints: 4, badges: 1, rank: 38 },
  { id: "39", name: "CallDataPro", totalPoints: 1120, weeklyPoints: 2, badges: 0, rank: 39 },
  { id: "40", name: "ReturnValueExpert", totalPoints: 1050, weeklyPoints: 1, badges: 0, rank: 40 },
  { id: "41", name: "RevertReason", totalPoints: 980, weeklyPoints: 0, badges: 1, rank: 41 },
  { id: "42", name: "ExceptionHandler", totalPoints: 920, weeklyPoints: 0, badges: 0, rank: 42 },
  { id: "43", name: "TryCatchMaster", totalPoints: 850, weeklyPoints: 0, badges: 0, rank: 43 },
  { id: "44", name: "ErrorDecoder", totalPoints: 780, weeklyPoints: 0, badges: 1, rank: 44 },
  { id: "45", name: "DebugTracer", totalPoints: 720, weeklyPoints: 0, badges: 0, rank: 45 },
  { id: "46", name: "StackOverflow", totalPoints: 650, weeklyPoints: 0, badges: 0, rank: 46 },
  { id: "47", name: "OutOfGas", totalPoints: 580, weeklyPoints: 0, badges: 1, rank: 47 },
  { id: "48", name: "InsufficientFunds", totalPoints: 520, weeklyPoints: 0, badges: 0, rank: 48 },
  { id: "49", name: "UnauthorizedAccess", totalPoints: 450, weeklyPoints: 0, badges: 0, rank: 49 },
  { id: "50", name: "ContractNotFound", totalPoints: 380, weeklyPoints: 0, badges: 1, rank: 50 },
  { id: "51", name: "FunctionNotFound", totalPoints: 320, weeklyPoints: 0, badges: 0, rank: 51 },
  // Additional players for positions 51-66
  { id: "52", name: "InvalidOpcode", totalPoints: 310, weeklyPoints: 0, badges: 0, rank: 52 },
  { id: "53", name: "StackUnderflow", totalPoints: 300, weeklyPoints: 0, badges: 1, rank: 53 },
  { id: "54", name: "BadJumpDestination", totalPoints: 290, weeklyPoints: 0, badges: 0, rank: 54 },
  { id: "55", name: "OutOfBounds", totalPoints: 280, weeklyPoints: 0, badges: 0, rank: 55 },
  { id: "56", name: "InvalidInput", totalPoints: 270, weeklyPoints: 0, badges: 1, rank: 56 },
  { id: "57", name: "ExecutionReverted", totalPoints: 260, weeklyPoints: 0, badges: 0, rank: 57 },
  { id: "58", name: "StaticCallFailed", totalPoints: 250, weeklyPoints: 0, badges: 0, rank: 58 },
  { id: "59", name: "DelegateCallFailed", totalPoints: 240, weeklyPoints: 0, badges: 1, rank: 59 },
  { id: "60", name: "CreateFailed", totalPoints: 230, weeklyPoints: 0, badges: 0, rank: 60 },
  { id: "61", name: "Create2Failed", totalPoints: 220, weeklyPoints: 0, badges: 0, rank: 61 },
  { id: "62", name: "SelfDestructFailed", totalPoints: 210, weeklyPoints: 0, badges: 1, rank: 62 },
  { id: "63", name: "InvalidJump", totalPoints: 200, weeklyPoints: 0, badges: 0, rank: 63 },
  { id: "64", name: "InvalidInstruction", totalPoints: 195, weeklyPoints: 0, badges: 0, rank: 64 },
  { id: "65", name: "BadInstruction", totalPoints: 190, weeklyPoints: 0, badges: 1, rank: 65 },
  { id: "66", name: "UndefinedInstruction", totalPoints: 185, weeklyPoints: 0, badges: 0, rank: 66 },
  { id: "67", name: "InvalidMemoryAccess", totalPoints: 182, weeklyPoints: 0, badges: 0, rank: 67 },
]

export const mockMissions = [
  {
    id: "daily_1",
    title: "Discord Daily Check-in",
    description: "Visit the IOPn Discord server and react to the daily announcement",
    type: "daily",
    category: "social",
    status: "available",
    repReward: 50,
    requirements: ["Join IOPn Discord server", "React to daily announcement"],
    timeLimit: "24 hours",
  },
  {
    id: "daily_2",
    title: "Social Media Engagement",
    description: "Like and retweet the latest IOPn post on Twitter",
    type: "daily",
    category: "social",
    status: "available",
    repReward: 25,
    requirements: ["Follow @IOPn on Twitter", "Like and retweet latest post"],
    timeLimit: "24 hours",
  },
  {
    id: "weekly_1",
    title: "Gaming Tournament Participation",
    description: "Participate in at least 3 gaming tournaments this week",
    type: "weekly",
    category: "gaming",
    status: "in-progress",
    repReward: 200,
    progress: 2,
    target: 3,
    requirements: ["Join 3 gaming tournaments", "Complete at least 1 match per tournament"],
    timeLimit: "7 days",
  },
  {
    id: "weekly_2",
    title: "Referral Challenge",
    description: "Invite 2 new members to join IOPn this week",
    type: "weekly",
    category: "referral",
    status: "available",
    repReward: 300,
    progress: 0,
    target: 2,
    requirements: ["Share referral code", "2 successful signups using your code"],
    timeLimit: "7 days",
  },
  {
    id: "special_1",
    title: "NFT Genesis Collection",
    description: "Mint your first Origin NFT and customize it with badges",
    type: "special",
    category: "engagement",
    status: "available",
    repReward: 500,
    badgeReward: "Genesis Collector",
    requirements: ["Mint Origin NFT", "Equip 3 badges to NFT", "Share NFT on social media"],
    timeLimit: "30 days",
  },
  {
    id: "special_2",
    title: "Community Champion",
    description: "Help onboard 10 new community members and guide them through their first week",
    type: "special",
    category: "referral",
    status: "available",
    repReward: 1000,
    badgeReward: "Community Champion",
    requirements: ["Refer 10 new members", "Each member completes 3 missions", "Maintain 90% retention rate"],
    timeLimit: "60 days",
  },
]

export const mockBadges = [
  {
    id: "badge_1",
    name: "Originator",
    description: "The ultimate creator and innovator - one who brings new ideas to life",
    rarity: "legendary",
    price: 0,
    image: "/images/badges/ORIGINATOR - FINAL V1.png",  // ← Update this
    category: "achievement",
    owned: true,
    equipped: true,
    repThreshold: 0,
  },
  {
    id: "badge_2",
    name: "Culture Catalyst",
    description: "Influential community member who sparks cultural change and inspiration",
    rarity: "epic",
    price: 150,
    image: "/images/badges/CULTURE CATALYST - FINAL V1.png",  // ← Update this
    category: "social",
    owned: true,
    equipped: true,
    repThreshold: 1000,
  },
  {
    id: "badge_3",
    name: "Signal Runner",
    description: "Swift communicator who delivers messages and connects communities",
    rarity: "rare",
    price: 75,
    image: "/images/badges/SIGNAL RUNNER - FINAL V1.png",  // ← Update this
    category: "social",
    owned: true,
    equipped: false,
    repThreshold: 500,
  },
  {
    id: "badge_4",
    name: "Network Architect",
    description: "Master of network design and distributed system architecture",
    rarity: "epic",
    price: 200,
    image: "/images/badges/NETWORK ARCHITECT - FINAL V1.png",  // ← Update this (note: no underscore before V1)
    category: "technical",
    owned: false,
    equipped: false,
    repThreshold: 1500,
  },
  {
    id: "badge_5",
    name: "Server OG",
    description: "Foundational expert in server infrastructure and backend systems",
    rarity: "legendary",
    price: 250,
    image: "/images/badges/SERVER OG - FINAL V1.png",  // ← Update this
    category: "technical",
    owned: false,
    equipped: false,
    repThreshold: 2500,
  },
]

export const mockGames = [
  {
    id: "fortnite",
    name: "Fortnite",
    image: "/placeholder.svg",
    players: 1250,
    tournaments: [
      { id: "fn_1", name: "Weekly Battle Royale", prize: "500 REP", status: "active", participants: 64 },
      { id: "fn_2", name: "Solo Championship", prize: "1000 REP", status: "upcoming", participants: 0 },
    ],
  },
  {
    id: "warzone",
    name: "Call of Duty: Warzone",
    image: "/placeholder.svg",
    players: 890,
    tournaments: [
      { id: "wz_1", name: "Tactical Showdown", prize: "750 REP", status: "active", participants: 32 },
      { id: "wz_2", name: "Squad Elimination", prize: "600 REP", status: "completed", participants: 48 },
    ],
  },
  {
    id: "rocket_league",
    name: "Rocket League",
    image: "/placeholder.svg",
    players: 650,
    tournaments: [
      { id: "rl_1", name: "Car Soccer Championship", prize: "400 REP", status: "active", participants: 24 },
      { id: "rl_2", name: "Aerial Masters", prize: "800 REP", status: "upcoming", participants: 0 },
    ],
  },
  {
    id: "pubg",
    name: "PUBG",
    image: "/placeholder.svg",
    players: 720,
    tournaments: [
      { id: "pubg_1", name: "Survival Challenge", prize: "650 REP", status: "active", participants: 100 },
      { id: "pubg_2", name: "Squad Tactics", prize: "550 REP", status: "upcoming", participants: 0 },
    ],
  },
  {
    id: "valorant",
    name: "Valorant",
    image: "/placeholder.svg",
    players: 580,
    tournaments: [
      { id: "val_1", name: "Tactical Strike", prize: "700 REP", status: "upcoming", participants: 0 },
      { id: "val_2", name: "Agent Showdown", prize: "450 REP", status: "completed", participants: 40 },
    ],
  },
]

export const mockReferrals = [
  {
    id: "ref_1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    joinDate: "2024-01-15",
    status: "active",
    repEarned: 150,
  },
  {
    id: "ref_2",
    name: "Mike Rodriguez",
    email: "mike@example.com",
    joinDate: "2024-01-20",
    status: "active",
    repEarned: 200,
  },
  {
    id: "ref_3",
    name: "Emma Wilson",
    email: "emma@example.com",
    joinDate: "2024-01-25",
    status: "pending",
    repEarned: 50,
  },
]

// REP-based thresholds for features
export const repThresholds = {
  rareBadgeAccess: 500,
  epicBadgeAccess: 1000,
  legendaryBadgeAccess: 2000,
  prioritySupport: 1500,
  exclusiveEvents: 2500,
  doubleRepGaming: 1000,
  tripleRepGaming: 3000,
  marketplaceDiscount: 750,
  referralBonus: 1250,
}

// Helper function to get user's current rank
export const getUserRank = (userId) => {
  const user = mockLeaderboard.find((u) => u.id === userId)
  return user ? user.rank : mockLeaderboard.length + 1
}

// Helper function to get top N leaders
export const getTopLeaders = (count) => {
  return mockLeaderboard.slice(0, count)
}

// Helper function to get points needed to reach top 50
export const getPointsToTop50 = (userPoints) => {
  const fiftiethPlace = mockLeaderboard[49] // 50th position (0-indexed)
  return Math.max(0, fiftiethPlace.totalPoints - userPoints + 1)
}