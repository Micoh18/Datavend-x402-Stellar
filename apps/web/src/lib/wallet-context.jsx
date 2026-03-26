import { createContext, useContext, useState, useCallback } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [secretKey, setSecretKey] = useState(null);
  const [mode, setMode] = useState(null); // 'freighter' | 'demo'

  const connectFreighter = useCallback(async () => {
    try {
      const { isConnected, getAddress } = await import('@stellar/freighter-api');
      const connected = await isConnected();
      if (!connected) {
        connectDemo();
        return;
      }
      const { address: addr } = await getAddress();
      setAddress(addr);
      setSecretKey(null); // Freighter signs externally
      setMode('freighter');
    } catch {
      connectDemo();
    }
  }, []);

  const connectDemo = useCallback(() => {
    const demoPublic = import.meta.env.VITE_DEMO_BUYER_PUBLIC;
    const demoSecret = import.meta.env.VITE_DEMO_BUYER_SECRET;
    setAddress(demoPublic || 'GDEMO...');
    setSecretKey(demoSecret || null);
    setMode('demo');
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSecretKey(null);
    setMode(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{ address, secretKey, mode, connectFreighter, connectDemo, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
