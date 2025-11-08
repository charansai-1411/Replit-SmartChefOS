import { StatCard } from '../StatCard';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-4 bg-background grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
      <StatCard
        title="Daily Sales"
        value="₹85,000"
        trend="+12% today"
        icon={DollarSign}
      />
      <StatCard
        title="Orders"
        value="142"
        trend="+8% from yesterday"
        icon={ShoppingCart}
      />
      <StatCard
        title="Avg Ticket Size"
        value="₹598"
        trend="+5% this week"
        icon={TrendingUp}
      />
    </div>
  );
}
