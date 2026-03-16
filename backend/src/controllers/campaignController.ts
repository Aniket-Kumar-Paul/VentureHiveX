import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;

    const whereClause: any = {};
    if (status) {
      whereClause.status = typeof status === 'string' ? status : String(status);
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      take: Number(limit),
      skip: Number(offset),
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            name: true,
            company_name: true,
            wallet_address: true,
          }
        }
      }
    });

    const total = await prisma.campaign.count({ where: whereClause });

    res.json({
      data: campaigns,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCampaignById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
       res.status(400).json({ error: 'Campaign ID is required' });
       return;
    }

    const campaign = await prisma.campaign.findUnique({
      where: { campaign_id: String(id) },
      include: {
        creator: true,
        investments: {
          include: {
            user: {
              select: {
                name: true,
                wallet_address: true
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
