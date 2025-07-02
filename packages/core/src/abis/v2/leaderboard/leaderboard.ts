export const leaderboardAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "chainlinkCoordinatorAddress",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "maxRandomNFTs",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "minExpirationTime_",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "fee_",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AccessDenied",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyFinalized",
    type: "error",
  },
  {
    inputs: [],
    name: "EmptyShares",
    type: "error",
  },
  {
    inputs: [],
    name: "EndDateTooSmall",
    type: "error",
  },
  {
    inputs: [],
    name: "ExpirationTimeTooHigh",
    type: "error",
  },
  {
    inputs: [],
    name: "ExpirationTimeTooLow",
    type: "error",
  },
  {
    inputs: [],
    name: "Expired",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidChainlinkConfig",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPosition",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidValueSent",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidWinner",
    type: "error",
  },
  {
    inputs: [],
    name: "MinExpirationTimeTooLow",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEnded",
    type: "error",
  },
  {
    inputs: [],
    name: "NotExpired",
    type: "error",
  },
  {
    inputs: [],
    name: "NotFinalized",
    type: "error",
  },
  {
    inputs: [],
    name: "NothingToClaim",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "have",
        type: "address",
      },
      {
        internalType: "address",
        name: "want",
        type: "address",
      },
    ],
    name: "OnlyCoordinatorCanFulfill",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "have",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "coordinator",
        type: "address",
      },
    ],
    name: "OnlyOwnerOrCoordinator",
    type: "error",
  },
  {
    inputs: [],
    name: "RandomNftLengthExceedsLimit",
    type: "error",
  },
  {
    inputs: [],
    name: "SharesCountTooHigh",
    type: "error",
  },
  {
    inputs: [],
    name: "TaxedTokenNotTakenInCharge",
    type: "error",
  },
  {
    inputs: [],
    name: "WinnerCountTooHigh",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
    ],
    name: "Canceled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "nativePayment",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "requestConfirmations",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "callbackGasBase",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "callbackGasExtraNFT",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "vrfSubId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "keyHash",
        type: "bytes32",
      },
    ],
    name: "ChainlinkConfigSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "leaderboardId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Claimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "vrfCoordinator",
        type: "address",
      },
    ],
    name: "CoordinatorSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "previousFeeAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "feeAmount",
        type: "uint256",
      },
    ],
    name: "FeeSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "fees",
        type: "uint256",
      },
    ],
    name: "FeesWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "winners",
        type: "address[]",
      },
    ],
    name: "Finalized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        indexed: true,
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "endsAt",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "expirationTime",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalShares",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "shares",
        type: "uint256[]",
      },
    ],
    name: "LeaderboardCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint32",
        name: "previousMinExpirationTime",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "minExpirationTime",
        type: "uint32",
      },
    ],
    name: "MinExpirationTimeSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "leaderboardId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "position",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "collection",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "NFTClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "leaderboardId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "collection",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "NFTRewarded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "leaderboardId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "position",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "collection",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    name: "NFTUnclaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint32",
        name: "previousMaxRandomNFTs",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "maxRandomNFTs",
        type: "uint32",
      },
    ],
    name: "RandomNFTsLimitSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "leaderboardId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Unclaimed",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "LEADERBOARD_MANAGER",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "accumulatedFees",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
    ],
    name: "cancelLeaderboard",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "collection",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "claimNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "claimNFTs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        internalType: "address payable",
        name: "to",
        type: "address",
      },
    ],
    name: "claimTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "claimable",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "endsAt",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "expirationTime",
        type: "uint32",
      },
      {
        internalType: "uint256[]",
        name: "shares_",
        type: "uint256[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "collection",
            type: "address",
          },
          {
            internalType: "uint16",
            name: "position",
            type: "uint16",
          },
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
        ],
        internalType: "struct ILeaderboardHubCommon.NFTReward[]",
        name: "staticNfts_",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "collection",
            type: "address",
          },
          {
            internalType: "uint256[]",
            name: "ids",
            type: "uint256[]",
          },
        ],
        internalType: "struct ILeaderboardHubAffiliate.RandomNFTRewards[]",
        name: "randomNfts_",
        type: "tuple[]",
      },
    ],
    name: "createLeaderboard",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "fee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        internalType: "address[]",
        name: "winners_",
        type: "address[]",
      },
    ],
    name: "finalizeLeaderboard",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    name: "leaderboards",
    outputs: [
      {
        internalType: "address",
        name: "affiliate",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "endsAt",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "expirationTime",
        type: "uint32",
      },
      {
        internalType: "uint40",
        name: "expiresAt",
        type: "uint40",
      },
      {
        internalType: "uint256",
        name: "remaining",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "totalShares",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "leaderboardsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minExpirationTime",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "nftAvailable",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        internalType: "uint16",
        name: "position",
        type: "uint16",
      },
      {
        internalType: "address",
        name: "collection",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "pullUnclaimedNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        internalType: "address",
        name: "collection",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "pullUnclaimedNFTFromWinner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "pullUnclaimedNFTs",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "pullUnclaimedTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "randomNFTs",
    outputs: [
      {
        internalType: "address",
        name: "collection",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "position",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "randomNFTsLimit",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "requestId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "randomWords",
        type: "uint256[]",
      },
    ],
    name: "rawFulfillRandomWords",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "s_vrfCoordinator",
    outputs: [
      {
        internalType: "contract IVRFCoordinatorV2Plus",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "nativePayment",
        type: "bool",
      },
      {
        internalType: "uint16",
        name: "requestConfirmations",
        type: "uint16",
      },
      {
        internalType: "uint32",
        name: "callbackGasBase",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "callbackGasExtraNFT",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "vrfSubId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "keyHash",
        type: "bytes32",
      },
    ],
    name: "setChainlinkConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_vrfCoordinator",
        type: "address",
      },
    ],
    name: "setCoordinator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "feeAmount",
        type: "uint256",
      },
    ],
    name: "setFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "minExpirationTime_",
        type: "uint32",
      },
    ],
    name: "setMinExpirationTime",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "maxRandomNFTs",
        type: "uint32",
      },
    ],
    name: "setRandomNFTsLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
    ],
    name: "shares",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "staticNFTs",
    outputs: [
      {
        internalType: "address",
        name: "collection",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "position",
        type: "uint16",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "tokensClaimed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "winnerPositions",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "leaderboardId",
        type: "uint64",
      },
    ],
    name: "winners",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
