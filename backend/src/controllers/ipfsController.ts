import { Request, Response } from 'express';
import { PinataSDK } from 'pinata-web3';
import fs from 'fs';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT_SECRET, // Make sure the user provides a Pinata JWT instead of Key/Secret
  pinataGateway: "gateway.pinata.cloud"
});

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Using pinata-web3 to upload from standard filesystem path (multer saves to /tmp or defined dest)
    const fileStream = fs.createReadStream(req.file.path);
    const fileObj = new File([fs.readFileSync(req.file.path)], req.file.originalname, { type: req.file.mimetype });
    
    // We mock a web File object because pinata-web3 usually runs in browser or requires File
    const upload = await pinata.upload.file(fileObj);

    // Delete the temporary file created by multer
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      ipfsHash: upload.IpfsHash,
      gatewayUrl: `https://${pinata.config?.pinataGateway}/ipfs/${upload.IpfsHash}`
    });
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    res.status(500).json({ error: 'Failed to upload to IPFS' });
  }
};

export const uploadMetadata = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    res.status(500).json({ error: 'Failed to upload metadata to IPFS' });
  }
};
