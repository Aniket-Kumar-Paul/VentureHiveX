import { Router } from 'express';
import { getCampaigns, getCampaignById, getSyncStatus } from '../controllers/campaignController';

const router = Router();

router.get('/', getCampaigns);
router.get('/sync-status', getSyncStatus);
router.get('/:id', getCampaignById);

export default router;
