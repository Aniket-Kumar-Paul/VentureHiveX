"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearNonce = exports.getStoredNonceMessage = exports.generateNonce = void 0;
const crypto_1 = __importDefault(require("crypto"));
// In a production environment with multiple server instances, this should be stored in Redis.
// For now, an in-memory map is sufficient for a single Node process.
const nonceStore = new Map();
const generateNonce = (walletAddress) => {
    const nonce = crypto_1.default.randomBytes(16).toString('hex');
    const message = `Welcome to VentureHiveX!\n\nClick to sign in and accept the VentureHiveX Terms of Service.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nNonce: ${nonce}`;
    nonceStore.set(walletAddress.toLowerCase(), message);
    return message;
};
exports.generateNonce = generateNonce;
const getStoredNonceMessage = (walletAddress) => {
    return nonceStore.get(walletAddress.toLowerCase());
};
exports.getStoredNonceMessage = getStoredNonceMessage;
const clearNonce = (walletAddress) => {
    nonceStore.delete(walletAddress.toLowerCase());
};
exports.clearNonce = clearNonce;
