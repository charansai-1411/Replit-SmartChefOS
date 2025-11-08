import { Search, Printer, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Topbar() {
  return (
    <header className="border-b bg-card px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="relative w-80 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search menu, orders and more..."
            className="pl-10 rounded-xl"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" data-testid="button-print">
          <Printer className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" data-testid="button-kot">
          <FileText className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2 ml-2 pl-2 border-l" data-testid="user-profile">
          <Avatar className="w-9 h-9">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-primary text-primary-foreground">IK</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">Ibrahim Kadri</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
