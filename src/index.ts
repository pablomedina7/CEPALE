import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import hashRouter from "./routes/hash";
import verifyRouter from "./routes/verify";
import { errorHandler } from "./middlewares/errors";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN.length ? env.CORS_ORIGIN : true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/hash", hashRouter);
app.use("/verify", verifyRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});
