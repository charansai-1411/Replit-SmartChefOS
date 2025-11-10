import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Topbar } from "@/components/Topbar";
import { AuthProvider, ProtectedRoute } from "@/contexts/AuthContext";

import Dashboard from "@/pages/Dashboard";
import OrderLine from "@/pages/OrderLine";
import ManageDishes from "@/pages/ManageDishes";
import Customers from "@/pages/Customers";
import Tables from "@/pages/Tables";
import OnlineOrders from "@/pages/OnlineOrders";
import Inventory from "@/pages/Inventory";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "3rem",
          } as React.CSSProperties
        }
      >
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-hidden bg-background">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        {() => (
          <ProtectedLayout>
            <Tables />
          </ProtectedLayout>
        )}
      </Route>
      
      <Route path="/dashboard">
        {() => (
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        )}
      </Route>
      
      <Route path="/orders">
        {() => (
          <ProtectedLayout>
            <OrderLine />
          </ProtectedLayout>
        )}
      </Route>
      
      <Route path="/online">
        {() => (
          <ProtectedLayout>
            <OnlineOrders />
          </ProtectedLayout>
        )}
      </Route>
      
      <Route path="/tables">
        {() => (
          <ProtectedLayout>
            <Tables />
          </ProtectedLayout>
        )}
      </Route>
      
      <Route path="/dishes">
        {() => (
          <ProtectedLayout>
            <ManageDishes />
          </ProtectedLayout>
        )}
      </Route>
      
      <Route path="/inventory">
        {() => (
          <ProtectedLayout>
            <Inventory />
          </ProtectedLayout>
        )}
      </Route>
      
      <Route path="/customers">
        {() => (
          <ProtectedLayout>
            <Customers />
          </ProtectedLayout>
        )}
      </Route>
      
      <Route path="/profile">
        {() => (
          <ProtectedLayout>
            <Profile />
          </ProtectedLayout>
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

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
