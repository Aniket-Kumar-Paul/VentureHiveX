import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middlewares/authMiddleware';
import { generateNonce, getStoredNonceMessage, clearNonce } from '../services/nonceService';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

export const getNonce = async (req: Request, res: Response): Promise<void> => {
  const { walletAddress } = req.query;

  if (!walletAddress || typeof walletAddress !== 'string') {
    res.status(400).json({ error: 'walletAddress query parameter is required' });
    return;
  }

  try {
    const addressStr = walletAddress.toLowerCase();
    const nonceMessage = generateNonce(addressStr);
    
    // Ensure user exists locally if it's their first time
    const existingUser = await prisma.user.findUnique({
      where: { wallet_address: addressStr }
    });

    if (!existingUser) {
      // Default to 'investor', they can update it immediately after
      await prisma.user.create({
        data: {
          wallet_address: addressStr,
          role: 'investor' 
        }
      });
    }

    res.json({ message: nonceMessage });
  } catch (error) {
    console.error('Error in getNonce:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifySignature = async (req: Request, res: Response): Promise<void> => {
  const { walletAddress, signature } = req.body;

  if (!walletAddress || !signature) {
    res.status(400).json({ error: 'walletAddress and signature are required in body' });
    return;
  }

  try {
    const addressStr = walletAddress.toLowerCase();
    const messageToVerify = getStoredNonceMessage(addressStr);

    if (!messageToVerify) {
      res.status(400).json({ error: 'No nonce found for this wallet. Request a new nonce.' });
      return;
    }

    // Recover address from signature
    const recoveredAddress = ethers.verifyMessage(messageToVerify, signature);

    if (recoveredAddress.toLowerCase() !== addressStr) {
      res.status(401).json({ error: 'Signature verification failed' });
      return;
    }

    // Signature matches, clear nonce so it can't be reused
    clearNonce(addressStr);

    // Issue JWT
    const token = generateToken(addressStr);

    const user = await prisma.user.findUnique({
      where: { wallet_address: addressStr }
    });

    res.json({ token, user });
  } catch (error) {
    console.error('Error in verifySignature:', error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
};
