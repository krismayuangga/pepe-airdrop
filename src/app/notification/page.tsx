import dynamic from "next/dynamic";

// ClientApp is the main user dashboard app, already handles tab logic and notification rendering
const ClientApp = dynamic(() => import("@/components/ClientApp"), { ssr: false });

export default function NotificationPage() {
  return <ClientApp />;
}
