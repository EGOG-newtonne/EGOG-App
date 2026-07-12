export const giwaTestnet = {
  id: 91_342,
  name: "GIWA Sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sepolia-rpc.giwa.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "GIWA Sepolia Explorer",
      url: "https://sepolia-explorer.giwa.io",
    },
  },
  testnet: true,
} as const;
