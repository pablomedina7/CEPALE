import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { normalizePayload } from "../services/normalizer";
import { toBytes32Sha256 } from "../services/hasher";
import { anchorOnChain } from "../services/chain";

const r = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const schema = z.object({
  amount: z.union([z.number(), z.string()]),
  currency: z.string(),
  date: z.string(),
  from: z.string(),
  to: z.string(),
  reference: z.string()
});

r.post("/json", async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const { stable } = normalizePayload(data);
    const { bytes32 } = toBytes32Sha256(stable);
    const meta = "PYG|FACTURA|JSON";
    
    // Try to anchor on blockchain - if it fails, still return the hash
    try {
      const txResult = await anchorOnChain(bytes32, meta);
      
      res.json({ 
        hash: bytes32, 
        meta, 
        stable,
        blockchain: {
          status: "success",
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber,
          gasUsed: txResult.gasUsed
        }
      });
    } catch (blockchainError) {
      // Blockchain failed but hash generation succeeded
      res.json({ 
        hash: bytes32, 
        meta, 
        stable,
        blockchain: {
          status: "failed",
          error: (blockchainError instanceof Error ? blockchainError.message : String(blockchainError)).substring(0, 200) // Truncate long errors
        }
      });
    }
  } catch (e) { next(e); }
});

r.post("/file", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new Error("Falta 'file'");
    const { bytes32 } = toBytes32Sha256(req.file.buffer);
    const meta = "FILE|COMPROBANTE|BIN";
    
    // Try to anchor on blockchain - if it fails, still return the hash
    try {
      const txResult = await anchorOnChain(bytes32, meta);
      
      res.json({ 
        hash: bytes32, 
        meta, 
        filename: req.file.originalname,
        blockchain: {
          status: "success",
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber,
          gasUsed: txResult.gasUsed
        }
      });
    } catch (blockchainError) {
      // Blockchain failed but hash generation succeeded
      res.json({ 
        hash: bytes32, 
        meta, 
        filename: req.file.originalname,
        blockchain: {
          status: "failed",
          error: (blockchainError instanceof Error ? blockchainError.message : String(blockchainError)).substring(0, 200) // Truncate long errors
        }
      });
    }
  } catch (e) { next(e); }
});

export default r;
