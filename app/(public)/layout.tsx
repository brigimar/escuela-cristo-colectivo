import { HomeHeader } from "@/features/home/components/HomeHeader";
import { PublicFooter } from "@/features/home/components/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f1e4] font-display antialiased text-[#1f1a12]">
      <HomeHeader />
      <div className="min-h-[calc(100vh-64px)]">{children}</div>
      <PublicFooter />
    </div>
  );
}
