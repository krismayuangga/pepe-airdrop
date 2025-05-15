// Halaman ini akan menampilkan komponen ClientApp dengan tab referral aktif

"use client";
import dynamic from "next/dynamic";

// Import ClientApp secara dinamis agar tidak terjadi hydration error
const ClientApp = dynamic(() => import("../../components/ClientApp"), { ssr: false });

export default function ReferralPage() {
  // Tidak perlu state dan useEffect manual di sini.
  // Cukup render ClientApp, karena ClientApp sudah handle tab referral berdasarkan pathname.
  return <ClientApp />;
}
