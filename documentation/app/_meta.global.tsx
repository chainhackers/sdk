export default {
  index: "BetSwirl Documentation",
  // You can use JSX elements to change the look of titles in the sidebar, e.g. insert icons
  "protocol-hub": {
    title: "Protocol Hub",
    type: "page",
    items: {
      test: "Test",
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
