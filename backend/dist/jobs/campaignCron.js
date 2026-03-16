"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const cron = __importStar(require("node-cron"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let currentJob = null;
const startCronJobs = async () => {
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
        }
        else {
            startJob(schedule);
        }
    }
    catch (error) {
        console.error('[Cron] Error initializing cron jobs:', error);
    }
};
exports.startCronJobs = startCronJobs;
const startJob = (schedule) => {
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
        }
        catch (error) {
            console.error('[Cron] Error executing scheduled job:', error);
        }
    });
};
