import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { PlayerProvider } from "@/lib/player";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PlayerProvider>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </PlayerProvider>
  );
}
