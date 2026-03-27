import { createContext, useContext, useState, useCallback } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [mode, setMode] = useState(null); // 'freighter' | null
  const [error, setError] = useState(null);

  const connectFreighter = useCallback(async () => {
    setError(null);
    try {
      const { isConnected, requestAccess, getAddress } = await import('@stellar/freighter-api');

      // Check if extension is installed
      const { isConnected: installed } = await isConnected();
      if (!installed) {
        setError('Freighter no está instalado. Instalalo desde freighter.app');
        return;
      }

      // Request permission (opens Freighter popup)
      const access = await requestAccess();
      if (access.error) {
        setError('Acceso denegado en Freighter');
        return;
      }

      // Get the active address
      const { address: addr, error: addrError } = await getAddress();
      if (addrError || !addr) {
        setError('No se pudo obtener la dirección de Freighter');
        return;
      }

      setAddress(addr);
      setMode('freighter');
    } catch (err) {
      console.error('[WalletConnect]', err);
      setError('Error al conectar con Freighter. Verificá que la extensión esté activa.');
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setMode(null);
    setError(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{ address, mode, error, connectFreighter, disconnect }}
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
