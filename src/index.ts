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

app.get("/debug", async (_req, res) => {
  try {
    const { ethers } = await import("ethers");
    const provider = new ethers.JsonRpcProvider(env.RPC_URL);
    const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    
    res.json({
      config: {
        port: env.PORT,
        network: env.NETWORK,
        hasRpcUrl: !!env.RPC_URL,
        hasContractAddress: !!env.CONTRACT_ADDRESS,
        hasPrivateKey: !!env.PRIVATE_KEY,
        rpcUrl: env.RPC_URL ? env.RPC_URL.substring(0, 50) + "..." : "missing",
        contractAddress: env.CONTRACT_ADDRESS || "missing"
      },
      wallet: {
        address: wallet.address,
        balanceWei: balance.toString(),
        balanceETH: ethers.formatEther(balance),
        hasEnoughGas: Number(ethers.formatEther(balance)) > 0.001
      }
    });
  } catch (error) {
    res.json({
      error: error instanceof Error ? error.message : "Unknown error",
      config: {
        hasRpcUrl: !!env.RPC_URL,
        hasContractAddress: !!env.CONTRACT_ADDRESS,
        hasPrivateKey: !!env.PRIVATE_KEY
      }
    });
  }
});

app.get("/test-contract", async (_req, res) => {
  try {
    const { ethers } = await import("ethers");
    const provider = new ethers.JsonRpcProvider(env.RPC_URL);
    
    // Test if contract exists
    const code = await provider.getCode(env.CONTRACT_ADDRESS);
    const contractExists = code !== "0x";
    
    // Test with minimal ABI to see what functions exist
    const testABI = [
      "function exists(bytes32) view returns (bool)",
      "function anchoredAt(bytes32) view returns (uint256)"
    ];
    
    const contract = new ethers.Contract(env.CONTRACT_ADDRESS, testABI, provider);
    const testHash = "0x1234567890123456789012345678901234567890123456789012345678901234";
    
    const existsResult = await contract.exists(testHash);
    
    res.json({
      contractExists,
      codeLength: code.length,
      testCall: {
        exists: existsResult,
        hash: testHash
      },
      contractAddress: env.CONTRACT_ADDRESS
    });
  } catch (error) {
    res.json({
      error: error instanceof Error ? error.message : "Unknown error",
      contractAddress: env.CONTRACT_ADDRESS
    });
  }
});

app.use("/hash", hashRouter);
app.use("/verify", verifyRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});
