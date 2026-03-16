"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaignController_1 = require("../controllers/campaignController");
const router = (0, express_1.Router)();
router.get('/', campaignController_1.getCampaigns);
router.get('/:id', campaignController_1.getCampaignById);
exports.default = router;
