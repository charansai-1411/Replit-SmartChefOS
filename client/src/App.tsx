import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Topbar } from "@/components/Topbar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/hooks/useAuth";

import Dashboard from "@/pages/Dashboard";
import OrderLine from "@/pages/OrderLine";
import ManageDishes from "@/pages/ManageDishes";
import Customers from "@/pages/Customers";
import Tables from "@/pages/Tables";
import OnlineOrders from "@/pages/OnlineOrders";
import Inventory from "@/pages/Inventory";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import RestaurantWizard from "@/pages/RestaurantWizard";
import AcceptInvite from "@/pages/AcceptInvite";
import NotFound from "@/pages/not-found";

// Main App component that wraps everything with necessary providers
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes without sidebar */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/accept-invite" component={AcceptInvite} />
      
      {/* All other routes are protected and include the sidebar layout */}
      <Route>
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function AppLayout() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-auto bg-background p-4">
            <Switch>
              <Route path="/" component={Tables} />
              <Route path="/restaurant-wizard" component={RestaurantWizard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/orders" component={OrderLine} />
              <Route path="/online" component={OnlineOrders} />
              <Route path="/tables" component={Tables} />
              <Route path="/dishes" component={ManageDishes} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/customers" component={Customers} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}