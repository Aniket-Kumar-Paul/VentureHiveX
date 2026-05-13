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
    console.log('[Cron] Running scheduled check for campaign statuses...');
    try {
      const activeOrUpcomingCampaigns = await prisma.campaign.findMany({
        where: {
          status: {
            notIn: ['FUNDED', 'FAILED']
          }
        }
      });

      if (activeOrUpcomingCampaigns.length === 0) {
        console.log('[Cron] No active or upcoming campaigns to check.');
      } else {
        let updateCount = 0;

        for (const campaign of activeOrUpcomingCampaigns) {
          const amountRaised = BigInt(campaign.amountRaised || '0');
          const goalAmount = BigInt(campaign.goalAmount || '0');
          const now = new Date();
          
          let newStatus = campaign.status;

          if (amountRaised >= goalAmount) {
              newStatus = 'FUNDED';
          } else if (now < campaign.startTime) {
              newStatus = 'UPCOMING';
          } else if (now >= campaign.startTime && now <= campaign.endTime) {
              newStatus = 'ACTIVE';
          } else {
              newStatus = 'FAILED';
          }

          if (newStatus !== campaign.status) {
             await prisma.campaign.update({
               where: { campaign_id: campaign.campaign_id },
               data: { status: newStatus }
             });
             console.log(`[Cron] Campaign ${campaign.campaign_id} status updated from ${campaign.status} to ${newStatus}`);
             updateCount++;
          }
        }
        
        console.log(`[Cron] Status check complete. Updated ${updateCount} campaigns.`);
      }

      // Persist last sync time for frontend monitoring
      const nowIso = new Date().toISOString();
      await prisma.configuration.upsert({
        where: { key: 'LAST_SYNC_TIME' },
        update: { value: nowIso },
        create: { key: 'LAST_SYNC_TIME', value: nowIso }
      });

    } catch (error) {
      console.error('[Cron] Error executing scheduled job:', error);
    }
  });
};
