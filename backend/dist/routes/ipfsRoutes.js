"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const ipfsController_1 = require("../controllers/ipfsController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/' }); // Temp folder for multer
// IPFS uploads should be restricted to authenticated users
router.post('/upload', authMiddleware_1.authenticateToken, upload.single('file'), ipfsController_1.uploadFile);
router.post('/metadata', authMiddleware_1.authenticateToken, ipfsController_1.uploadMetadata);
exports.default = router;
