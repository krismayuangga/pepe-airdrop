"use client";
// Impor polyfill di bagian paling atas
import '@/utils/polyfills';

import { createConfig, WagmiProvider } from "wagmi";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { chains, connectors, modalTheme, projectId, transports } from "@/config/web3Config";
import { LanguageProvider } from "@/context/LanguageContext";

// Create QueryClient
const queryClient = new QueryClient();

// Wagmi v2 configuration
const wagmiConfig = createConfig({
  chains,
  transports,
  connectors,
});

export function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Init web3modal HANYA di client side
    if (typeof window !== 'undefined') {
      try {
        createWeb3Modal({
          wagmiConfig,
          projectId,
          enableAnalytics: false,
          themeMode: modalTheme.themeMode,
          themeVariables: modalTheme.themeVariables,
        });
        console.log("Web3Modal initialized on client");
      } catch (error) {
        console.error("Failed to initialize Web3Modal:", error);
      }
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          {mounted ? children : null}
        </LanguageProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
