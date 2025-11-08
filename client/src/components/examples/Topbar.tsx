import { Topbar } from '../Topbar';
import { SidebarProvider } from "@/components/ui/sidebar";

export default function TopbarExample() {
  return (
    <SidebarProvider>
      <Topbar />
    </SidebarProvider>
  );
}
