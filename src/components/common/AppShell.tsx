import { Sidebar } from "@/components/common/Sidebar";
import { Topbar } from "@/components/common/Topbar";

interface Props {
  title: string;
  subtitle?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ title, subtitle, toolbar, children }: Props) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} subtitle={subtitle} right={toolbar} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
