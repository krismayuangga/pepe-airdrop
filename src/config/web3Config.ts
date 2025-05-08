import { http } from "wagmi";
import { bsc, mainnet } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// Project ID WalletConnect
export const projectId = "52e6ed24ef2b6b9f9df7e7df2ef8f63f";

// Konfigurasi chains yang didukung
export const chains = [bsc, mainnet] as const;

// Konfigurasi transport untuk tiap chain
export const transports = {
  [bsc.id]: http(),
  [mainnet.id]: http(),
};

// Konfigurasi connectors
export const connectors = [
  injected(),
  walletConnect({
    projectId,
    showQrModal: true,
    metadata: {
      name: "Pepe Tubes Airdrop",
      description: "Complete tasks and earn PEPE token rewards",
      url: typeof window !== 'undefined' ? window.location.origin : 'https://pepetubes.io',
      icons: [typeof window !== 'undefined' ? `${window.location.origin}/logopepetubes.png` : '/logopepetubes.png'],
    },
  }),
];

// Modal theme
export const modalTheme = {
  themeMode: 'dark' as 'dark', // Pastikan tipe data yang spesifik
  themeVariables: {
    '--w3m-accent': '#FF7361',
    '--w3m-background-color': '#14192E',
    '--w3m-container-border-radius': '16px',
  },
};
