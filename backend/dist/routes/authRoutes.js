"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.get('/nonce', authController_1.getNonce);
router.post('/verify', authController_1.verifySignature);
exports.default = router;
