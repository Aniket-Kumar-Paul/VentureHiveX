"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignature = exports.getNonce = void 0;
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const nonceService_1 = require("../services/nonceService");
const ethers_1 = require("ethers");
const prisma = new client_1.PrismaClient();
const getNonce = async (req, res) => {
    const { walletAddress } = req.query;
    if (!walletAddress || typeof walletAddress !== 'string') {
        res.status(400).json({ error: 'walletAddress query parameter is required' });
        return;
    }
    try {
        const addressStr = walletAddress.toLowerCase();
        const nonceMessage = (0, nonceService_1.generateNonce)(addressStr);
        // Ensure user exists locally if it's their first time
        const existingUser = await prisma.user.findUnique({
            where: { wallet_address: addressStr }
        });
        if (!existingUser) {
            // Default to 'investor', they can update it immediately after
            await prisma.user.create({
                data: {
                    wallet_address: addressStr,
                    role: 'investor'
                }
            });
        }
        res.json({ message: nonceMessage });
    }
    catch (error) {
        console.error('Error in getNonce:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getNonce = getNonce;
const verifySignature = async (req, res) => {
    const { walletAddress, signature } = req.body;
    if (!walletAddress || !signature) {
        res.status(400).json({ error: 'walletAddress and signature are required in body' });
        return;
    }
    try {
        const addressStr = walletAddress.toLowerCase();
        const messageToVerify = (0, nonceService_1.getStoredNonceMessage)(addressStr);
        if (!messageToVerify) {
            res.status(400).json({ error: 'No nonce found for this wallet. Request a new nonce.' });
            return;
        }
        // Recover address from signature
        const recoveredAddress = ethers_1.ethers.verifyMessage(messageToVerify, signature);
        if (recoveredAddress.toLowerCase() !== addressStr) {
            res.status(401).json({ error: 'Signature verification failed' });
            return;
        }
        // Signature matches, clear nonce so it can't be reused
        (0, nonceService_1.clearNonce)(addressStr);
        // Issue JWT
        const token = (0, authMiddleware_1.generateToken)(addressStr);
        const user = await prisma.user.findUnique({
            where: { wallet_address: addressStr }
        });
        res.json({ token, user });
    }
    catch (error) {
        console.error('Error in verifySignature:', error);
        res.status(500).json({ error: 'Internal server error during verification' });
    }
};
exports.verifySignature = verifySignature;
