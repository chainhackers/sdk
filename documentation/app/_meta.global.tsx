const meta = {
  index: {
    title: "BetSwirl Documentation",
    display: "hidden",
    //breadcrumb: false,
  },
  // You can use JSX elements to change the look of titles in the sidebar, e.g. insert icons
  "protocol-hub": {
    title: "Protocol Hub",
    type: "page",
    items: {
      introduction: {
        title: "Introduction",
      },
      protocol: {
        title: "🌀 Protocol",
        items: {
          bets: {
            title: "$BETS",
          },
          staking: {
            title: "Staking",
          },
          contracts: {
            title: "Contracts",
          },
          team: {
            title: "Team",
          },
        },
      },
      casino: {
        title: "🎲 Casino",
        items: {
          games: {
            title: "Games",
          },
          pvp: {
            title: "PvP",
          },
        },
      },
      "sports-betting": {
        title: "⚽ Sports Betting",
        items: {
          betswirl: {
            title: "BetSwirl",
          },
          azuro: {
            title: "Azuro",
          },
        },
      },
      "where-to-bet": {
        title: "❓ Where to Bet?",
        items: {
          dapp: {
            title: "dApp",
          },
          "mini-app": {
            title: "Mini App (Farcaster)",
          },
          affiliates: {
            title: "Affiliates",
          },
        },
      },
      partners: {
        title: "🤝 Partners",
        items: {
          "become-a-partner": {
            title: "Become a Partner",
          },
          affiliates: {
            title: "Affiliate Program",
          },
          "bankroll-providers": {
            title: "Bankroll Provider Program",
          },
        },
      },
    },
    //breadcrumb: true,
    //timestamp: true,
  },
  "developer-hub": {
    title: "Developer Hub",
    type: "page",
    //breadcrumb: true,
    //timestamp: true,
    items: {
      sdks: {
        title: "SDKs",
        items: {
          core: {
            title: "Core",
          },
        },
      },
      guides: {
        title: "Guides",
      },
    },
  },
  "community-updates": {
    title: "Community Updates",
    type: "page",
    items: {
      test: "Test",
    },
  },
};

export default meta;
