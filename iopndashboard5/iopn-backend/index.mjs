import express from 'express';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import dotenv from 'dotenv';
import cors from 'cors';
import FormData from 'form-data';
import fetch from 'node-fetch';
import axios from 'axios';
import { ethers } from "ethers";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use('/images', express.static('outputs'));

// Environment variables
const HF_TOKEN = process.env.HF_TOKEN;
const API_KEY = process.env.API_KEY;
const PINATA_JWT = process.env.PINATA_JWT;
const OUTPUT_DIR = path.resolve('./outputs');
const LOGO_PATH = path.resolve('./assets/IOPnlogo.png');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

// Store generated images metadata temporarily
const generatedMeta = {}; // filename → { prompt }
const generatedBatch = {}; // filename → [all filenames in that batch]

// Middleware to check API key
function authenticateKey(req, res, next) {
  const userKey = req.headers['authorization'];
  if (!userKey || userKey !== API_KEY) {
    return res.status(403).json({ error: 'Unauthorized: Invalid API Key' });
  }
  next();
}

// Query Hugging Face for image generation
async function queryHuggingFace(prompt, indexTag) {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Model error ${response.status}: ${text}`);
  }
  
  const blob = await response.blob();
  const buffer = Buffer.from(await blob.arrayBuffer());
  const outputPath = path.join(OUTPUT_DIR, `output_${indexTag}.png`);
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
}

// Add IOPn logo overlay to generated images
async function overlayLogo(baseImagePath, indexTag) {
  const logoBuf = await sharp(LOGO_PATH)
    .resize({ width: 100 })
    .png()
    .toBuffer();

  const outputPath = path.join(OUTPUT_DIR, `branded_${indexTag}.png`);
  await sharp(baseImagePath)
    .composite([{ input: logoBuf, top: 20, left: 20 }])
    .toFile(outputPath);

  fs.unlinkSync(baseImagePath);
  return outputPath;
}

// ==================== API ENDPOINTS ====================

// Generate NFT Images
// Generate NFT Images
app.post('/generate', authenticateKey, async (req, res) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Add random elements to ensure different outputs
    const styles = ['cinematic', 'artistic', 'photorealistic', 'digital art', 'concept art', 'fantasy art'];
    const moods = ['dramatic', 'vibrant', 'mysterious', 'epic', 'futuristic', 'ethereal'];
    const angles = ['wide angle', 'close-up', 'aerial view', 'low angle', 'dynamic perspective', 'side view'];
    
    // Single themed context for all NFTs
    const baseContext = "A NFT-worthy cinematic artwork in a futuristic digital world with vibrant colors, dynamic lighting, and imaginative elements.";
    
    // Generate 3 variations with different random elements
    const batch = [];
    const timestamp = Date.now();
    const tags = [`${timestamp}_1`, `${timestamp}_2`, `${timestamp}_3`];

    await Promise.all(tags.map(async (tag, index) => {
      // Randomize style elements for each variation
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      const randomAngle = angles[Math.floor(Math.random() * angles.length)];
      const randomSeed = Math.random() * 1000000; // Add random seed
      
      const fullPrompt = `${baseContext} The scene depicts: ${prompt}. 
        Style: ${randomStyle}, ${randomMood} mood, ${randomAngle} shot.
        Unique seed: ${randomSeed}.
        Make it unique, visually striking, and suitable for an NFT collection.`;
      
      const rawImage = await queryHuggingFace(fullPrompt, tag);
      const brandedImage = await overlayLogo(rawImage, tag);
      const filename = path.basename(brandedImage);
      
      // Store metadata
      generatedMeta[filename] = { prompt };
      batch.push(filename);
    }));

    // Track batch for cleanup
    batch.forEach(filename => {
      generatedBatch[filename] = batch;
    });

    res.json({ 
      success: true, 
      images: batch,
      message: "Successfully generated 3 NFT image variations"
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate images', 
      detail: error.message 
    });
  }
});

// Upload to IPFS and Get Metadata
app.post('/upload/ipfs', authenticateKey, async (req, res) => {
  const { filename, name, description } = req.body;
  
  if (!filename) {
    return res.status(400).json({ error: 'Filename is required' });
  }

  const meta = generatedMeta[filename];
  if (!meta) {
    return res.status(404).json({ error: 'Image not found in generation cache' });
  }

  const imagePath = path.join(OUTPUT_DIR, filename);
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: 'Image file not found' });
  }

  try {
    // Upload image to Pinata
    const imageForm = new FormData();
    imageForm.append('file', fs.createReadStream(imagePath));
    imageForm.append('pinataMetadata', JSON.stringify({ name: filename }));
    
    const imageUpload = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      imageForm,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          ...imageForm.getHeaders()
        },
        maxBodyLength: Infinity
      }
    );
    
    const imageCID = imageUpload.data.IpfsHash;
    const imageURL = `https://gateway.pinata.cloud/ipfs/${imageCID}`;

    // Create NFT metadata
    const metadata = {
      name: name || `IOPn Origin NFT #${Math.floor(Math.random() * 9999) + 1}`,
      description: description || meta.prompt,
      image: imageURL,
      attributes: [
        { trait_type: 'Collection', value: 'Origin' },
        { trait_type: 'Generated', value: new Date().toISOString() }
      ]
    };

    // Upload metadata to Pinata - FIXED VERSION
    const metadataForm = new FormData();
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    metadataForm.append('file', metadataBuffer, {
      filename: 'metadata.json',
      contentType: 'application/json',
    });
    metadataForm.append('pinataMetadata', JSON.stringify({ name: `metadata_${filename}` }));
    
    const metadataUpload = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      metadataForm,
      {
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          ...metadataForm.getHeaders()
        },
        maxBodyLength: Infinity
      }
    );
    
    const metadataCID = metadataUpload.data.IpfsHash;
    const metadataURL = `https://gateway.pinata.cloud/ipfs/${metadataCID}`;

    // Clean up generated files for this batch
    const batchFiles = generatedBatch[filename] || [];
    batchFiles.forEach(file => {
      const filePath = path.join(OUTPUT_DIR, file);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      delete generatedMeta[file];
    });
    delete generatedBatch[filename];

    res.json({
      success: true,
      metadata_url: metadataURL,
      image_url: imageURL,
      metadata: metadata,
      ipfs: {
        image_cid: imageCID,
        metadata_cid: metadataCID
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload to IPFS', 
      detail: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'IOPn NFT Generation API',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 IOPn NFT Backend running on http://localhost:${PORT}`);
  console.log(`📁 Serving images from: ${OUTPUT_DIR}`);
});