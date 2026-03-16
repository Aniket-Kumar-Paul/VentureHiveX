import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const walletAddress = req.user?.walletAddress;

    if (!walletAddress) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { wallet_address: walletAddress },
      include: {
        campaigns: true,
        investments: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const walletAddress = req.user?.walletAddress;

    if (!walletAddress) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const {
      role,
      name,
      gender,
      dob,
      email,
      description,
      company_name,
      company_url
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { wallet_address: walletAddress },
      data: {
        role,
        name,
        gender,
        dob: dob ? new Date(dob) : undefined,
        email,
        description,
        company_name,
        company_url
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
