import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import campaignRoutes from './routes/campaignRoutes';
import ipfsRoutes from './routes/ipfsRoutes';
import { startIndexer } from './indexer/blockchainIndexer';
import { startCronJobs } from './jobs/campaignCron';

dotenv.config();

const app = express();
const port = parseInt(process.env.SERVER_PORT || '8000', 10);
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic Health Check
app.get('/health', async (req, res) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: 'Disconnected', error: String(error) });
  }
});

// API Routes
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/ipfs', ipfsRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  
  // Start Blockchain Indexer
  startIndexer();

  // Start Background Cron Jobs
  startCronJobs();
});

export default app;
