import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { normalizePayload } from "../services/normalizer";
import { toBytes32Sha256 } from "../services/hasher";

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

r.post("/json", (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const { stable } = normalizePayload(data);
    const { bytes32 } = toBytes32Sha256(stable);
    const meta = "PYG|FACTURA|JSON";
    res.json({ hash: bytes32, meta, stable });
  } catch (e) { next(e); }
});

r.post("/file", upload.single("file"), (req, res, next) => {
  try {
    if (!req.file) throw new Error("Falta 'file'");
    const { bytes32 } = toBytes32Sha256(req.file.buffer);
    const meta = "FILE|COMPROBANTE|BIN";
    res.json({ hash: bytes32, meta, filename: req.file.originalname });
  } catch (e) { next(e); }
});

export default r;
