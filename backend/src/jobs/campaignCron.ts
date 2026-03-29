import * as cron from 'node-cron';
import prisma from '../config/prismaClient';

let currentJob: cron.ScheduledTask | null = null;

export const startCronJobs = async () => {
  try {
    // 1. Fetch CRON_SCHEDULE_MINUTES from DB
    let config = await prisma.configuration.findUnique({
      where: { key: 'CRON_SCHEDULE_MINUTES' }
    });

    if (!config) {
      console.log('[Cron] No CRON_SCHEDULE_MINUTES found in DB. Setting default: 60 (Hourly)');
      config = await prisma.configuration.create({
        data: {
          key: 'CRON_SCHEDULE_MINUTES',
          value: '60'
        }
      });
    }

    const minutes = parseInt(config.value, 10);
    let schedule = '0 * * * *'; // default hourly

    if (isNaN(minutes) || minutes <= 0) {
      console.error(`[Cron] Invalid cron minutes in DB: ${config.value}. Falling back to hourly.`);
    } else if (minutes < 60) {
      schedule = `*/${minutes} * * * *`;
    } else if (minutes % 60 === 0) {
      const hours = minutes / 60;
      schedule = `0 */${hours} * * *`;
    } else {
      console.warn(`[Cron] Minutes > 60 and not a multiple of 60 (${minutes}). Falling back to hourly.`);
    }

    if (!cron.validate(schedule)) {
      console.error(`[Cron] Generated invalid cron schedule: ${schedule}. Falling back to hourly.`);
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
