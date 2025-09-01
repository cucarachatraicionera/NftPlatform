// app/page.tsx
"use client";
import dynamic from "next/dynamic";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import PayButton from "@/components/PayButton";

// Para evitar SSR issues con window (wallet adapters)
const DynamicMultiButton = dynamic(
  async () => ({ default: WalletMultiButton }),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center gap-8">
      <DynamicMultiButton />
      {/* Precio de ejemplo: 0.25 SOL; split 60% bot / 40% owner */}
      <PayButton priceSol={0.25} botPct={60} ownerPct={40} />
    </main>
  );
}
