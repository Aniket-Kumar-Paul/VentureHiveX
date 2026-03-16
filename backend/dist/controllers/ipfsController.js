"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMetadata = exports.uploadFile = void 0;
const pinata_web3_1 = require("pinata-web3");
const fs_1 = __importDefault(require("fs"));
const pinata = new pinata_web3_1.PinataSDK({
    pinataJwt: process.env.PINATA_JWT_SECRET, // Make sure the user provides a Pinata JWT instead of Key/Secret
    pinataGateway: "gateway.pinata.cloud"
});
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        // Using pinata-web3 to upload from standard filesystem path (multer saves to /tmp or defined dest)
        const fileStream = fs_1.default.createReadStream(req.file.path);
        const fileObj = new File([fs_1.default.readFileSync(req.file.path)], req.file.originalname, { type: req.file.mimetype });
        // We mock a web File object because pinata-web3 usually runs in browser or requires File
        const upload = await pinata.upload.file(fileObj);
        // Delete the temporary file created by multer
        fs_1.default.unlinkSync(req.file.path);
        res.json({
            success: true,
            ipfsHash: upload.IpfsHash,
            gatewayUrl: `https://${pinata.config?.pinataGateway}/ipfs/${upload.IpfsHash}`
        });
    }
    catch (error) {
        console.error('Error uploading file to Pinata:', error);
        res.status(500).json({ error: 'Failed to upload to IPFS' });
    }
};
exports.uploadFile = uploadFile;
const uploadMetadata = async (req, res) => {
    try {
        const { title, description, image, attributes } = req.body;
        if (!title || !description) {
            res.status(400).json({ error: 'Title and description are required' });
            return;
        }
        const metadata = {
            name: title,
            description,
            image,
            attributes: attributes || []
        };
        const upload = await pinata.upload.json(metadata);
        res.json({
            success: true,
            ipfsHash: upload.IpfsHash,
            gatewayUrl: `https://${pinata.config?.pinataGateway}/ipfs/${upload.IpfsHash}`
        });
    }
    catch (error) {
        console.error('Error uploading metadata to Pinata:', error);
        res.status(500).json({ error: 'Failed to upload metadata to IPFS' });
    }
};
exports.uploadMetadata = uploadMetadata;
