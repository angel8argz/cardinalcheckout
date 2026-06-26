import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function ConsoleLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Header />
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}
