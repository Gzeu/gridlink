import { ApiNetworkProvider } from '@multiversx/sdk-network-providers';
import { Account, SignableMessage } from '@multiversx/sdk-core';
import { UserSigner } from '@multiversx/sdk-wallet';

// MultiversX EGLD blockchain integration for payments
const apiUrl = process.env.NEXT_PUBLIC_EGLD_API_URL || 'https://devnet-api.multiversx.com';
const chainId = process.env.NEXT_PUBLIC_EGLD_CHAIN_ID || 'D';

const apiProvider = new ApiNetworkProvider(apiUrl, { timeout: 10000 });

export interface EGLDPayment {
  amount: string; // in decimal format (e.g. "0.5" for 0.5 EGLD)
  to: string; // recipient address
  from?: string; // sender address
  data?: string; // transaction data
}

export interface TransactionResult {
  txHash: string;
  status: 'pending' | 'success' | 'failed';
  explorer: string;
}

// Get user account info from blockchain
export async function getAccountInfo(address: string): Promise<Account | null> {
  try {
    const account = new Account();
    const onChain = await apiProvider.getAccount(address);
    account.update(onChain);
    return account;
  } catch (error) {
    console.error('Error fetching account:', error);
    return null;
  }
}

// Verify blockchain address format
export function isValidEGLDAddress(address: string): boolean {
  return /^erd1[a-z0-9]{58}$/i.test(address);
}

// Sign message with private key (for backend verification)
export async function signMessage(
  message: string,
  privateKey: string,
): Promise<string | null> {
  try {
    const signer = new UserSigner(privateKey);
    const signableMessage = new SignableMessage({
      message: Buffer.from(message),
    });
    const signature = await signer.sign(signableMessage);
    return signature.toString('hex');
  } catch (error) {
    console.error('Error signing message:', error);
    return null;
  }
}

// Get transaction status from blockchain
export async function getTransactionStatus(txHash: string): Promise<string> {
  try {
    const tx = await apiProvider.getTransaction(txHash);
    return tx.status;
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return 'unknown';
  }
}

// Format EGLD for display (18 decimals)
export function formatEGLD(amount: string): string {
  const val = BigInt(amount);
  const denominator = BigInt(10 ** 18);
  const whole = val / denominator;
  const remainder = val % denominator;
  return remainder === BigInt(0)
    ? whole.toString()
    : `${whole}.${remainder.toString().padEnd(18, '0')}`;
}

export const egldChainId = chainId;
export const egldProvider = apiProvider;
