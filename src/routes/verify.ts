import { Router } from "express";
import { checkOnChain } from "../services/chain";

const r = Router();

r.get("/:hash", async (req, res, next) => {
  try {
    const h = String(req.params.hash || "");
    if (!/^0x[a-fA-F0-9]{64}$/.test(h)) {
      return res.status(400).json({ error: "hash inválido (esperado 0x + 64 hex)" });
    }
    const data = await checkOnChain(h);
    res.json(data);
  } catch (e) { next(e); }
});

export default r;
