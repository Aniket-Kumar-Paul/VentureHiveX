import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let currentJob: cron.ScheduledTask | null = null;

export const startCronJobs = async () => {
  try {
    // 1. Fetch CRON_SCHEDULE from DB
    let config = await prisma.configuration.findUnique({
      where: { key: 'CRON_SCHEDULE' }
    });

    if (!config) {
      console.log('[Cron] No CRON_SCHEDULE found in DB. Setting default: 0 * * * * (Hourly)');
      config = await prisma.configuration.create({
        data: {
          key: 'CRON_SCHEDULE',
          value: '0 * * * *'
        }
      });
    }

    const schedule = config.value;

    if (!cron.validate(schedule)) {
      console.error(`[Cron] Invalid cron schedule in DB: ${schedule}. Falling back to hourly.`);
      startJob('0 * * * *');
    } else {
      startJob(schedule);
    }
  } catch (error) {
    console.error('[Cron] Error initializing cron jobs:', error);
  }
};

const startJob = (schedule: string) => {
  if (currentJob) {
    currentJob.stop();
  }

  console.log(`[Cron] Starting campaign status checker with schedule: ${schedule}`);

  currentJob = cron.schedule(schedule, async () => {
    console.log('[Cron] Running scheduled check for expired campaigns...');
    try {
      const activeCampaigns = await prisma.campaign.findMany({
        where: {
          status: 'ACTIVE',
          endTime: {
            lt: new Date() // endTime has passed
          }
        }
      });

      if (activeCampaigns.length === 0) {
        console.log('[Cron] No expired active campaigns found.');
        return;
      }

      console.log(`[Cron] Found ${activeCampaigns.length} expired campaigns. Updating statuses...`);

      for (const campaign of activeCampaigns) {
        // Evaluate if goal was met
        const amountRaised = BigInt(campaign.amountRaised);
        const goalAmount = BigInt(campaign.goalAmount);
        
        const newStatus = amountRaised >= goalAmount ? 'FUNDED' : 'FAILED';

        await prisma.campaign.update({
          where: { campaign_id: campaign.campaign_id },
          data: { status: newStatus }
        });

        console.log(`[Cron] Campaign ${campaign.campaign_id} status updated to ${newStatus}`);
      }

    } catch (error) {
      console.error('[Cron] Error executing scheduled job:', error);
    }
  });
};
