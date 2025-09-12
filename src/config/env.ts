import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  CORS_ORIGIN: (process.env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean),
  RPC_URL: process.env.RPC_URL || "",
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "",
  NETWORK: process.env.NETWORK || "sepolia",
  PRIVATE_KEY: process.env.PRIVATE_KEY || ""
};
