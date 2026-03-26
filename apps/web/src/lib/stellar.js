// Stellar testnet utilities
export const HORIZON_TESTNET = 'https://horizon-testnet.stellar.org';
export const STELLAR_EXPERT_TESTNET = 'https://stellar.expert/explorer/testnet';

export function txExplorerUrl(txHash) {
  return `${STELLAR_EXPERT_TESTNET}/tx/${txHash}`;
}

export function accountExplorerUrl(address) {
  return `${STELLAR_EXPERT_TESTNET}/account/${address}`;
}

export function truncateAddress(addr) {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Fetch recent transactions from Horizon testnet (for explorer page)
export async function fetchRecentTransactions(limit = 10) {
  try {
    const res = await fetch(
      `${HORIZON_TESTNET}/transactions?order=desc&limit=${limit}`
    );
    const json = await res.json();
    return json._embedded?.records || [];
  } catch {
    return [];
  }
}
