// components/PayButton.tsx
"use client";

import { useCallback, useState } from "react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

type Props = { priceSol: number; botPct: number; ownerPct: number };

export default function PayButton({ priceSol, botPct, ownerPct }: Props) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [status, setStatus] = useState<null | string>(null);

  const onPay = useCallback(async () => {
    try {
      if (!publicKey) throw new Error("Conecta tu wallet primero");

      const totalLamports = Math.round(priceSol * LAMPORTS_PER_SOL);
      const botLamports = Math.floor((totalLamports * botPct) / 100);
      const ownerLamports = totalLamports - botLamports;

      const bot = new PublicKey(process.env.NEXT_PUBLIC_TREASURY_BOT!);
      const owner = new PublicKey(process.env.NEXT_PUBLIC_TREASURY_OWNER!);

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      const tx = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: bot,
          lamports: botLamports,
        }),
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: owner,
          lamports: ownerLamports,
        })
      );

      const sig = await sendTransaction(tx, connection, { skipPreflight: false });
      setStatus(`Enviada: ${sig}`);

      // Confirmación básica
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight });
      setStatus(`✅ Confirmada: ${sig}`);

      // TODO: aquí llamas a /api/mint para acuñar el NFT al comprador
    } catch (e: any) {
      setStatus(`❌ Error: ${e.message || e.toString()}`);
    }
  }, [publicKey, connection, sendTransaction, priceSol, botPct, ownerPct]);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onPay}
        className="rounded-xl px-5 py-3 font-medium bg-black text-white hover:opacity-80"
      >
        Comprar NFT ({priceSol} SOL)
      </button>
      {status && <p className="text-sm text-gray-600 text-center max-w-[640px]">{status}</p>}
    </div>
  );
}
