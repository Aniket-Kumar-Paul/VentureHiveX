import crypto from 'crypto';

// In a production environment with multiple server instances, this should be stored in Redis.
// For now, an in-memory map is sufficient for a single Node process.
const nonceStore = new Map<string, string>();

export const generateNonce = (walletAddress: string): string => {
  const nonce = crypto.randomBytes(16).toString('hex');
  const message = `Welcome to VentureHiveX!\n\nClick to sign in and accept the VentureHiveX Terms of Service.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nNonce: ${nonce}`;
  
  nonceStore.set(walletAddress.toLowerCase(), message);
  
  return message;
};

export const getStoredNonceMessage = (walletAddress: string): string | undefined => {
  return nonceStore.get(walletAddress.toLowerCase());
};

export const clearNonce = (walletAddress: string): void => {
  nonceStore.delete(walletAddress.toLowerCase());
};
