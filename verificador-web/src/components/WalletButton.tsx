"use client";
import { useState } from "react";
import type { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export default function WalletButton() {
  const [account, setAccount] = useState<string>("");

  async function connect() {
    if (!window.ethereum) {
      alert("Instalá MetaMask");
      return;
    }
    const accounts = (await window.ethereum.request({
      method: "eth_requestAccounts"
    })) as string[];
    setAccount(accounts[0]);
  }

  return (
    <button onClick={connect} className="px-4 py-2 rounded bg-black text-white">
      {account ? `Conectado: ${account.slice(0, 6)}…${account.slice(-4)}` : "Conectar Wallet"}
    </button>
  );
}
