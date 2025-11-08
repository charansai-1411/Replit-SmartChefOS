import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { ChefHat, DollarSign, ShoppingCart, TrendingUp, Lightbulb } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import paneerImage from '@assets/generated_images/Paneer_Butter_Masala_dish_80e08089.png';
import biryaniImage from '@assets/generated_images/Chicken_Biryani_dish_b8f84884.png';
import dosaImage from '@assets/generated_images/Masala_Dosa_breakfast_ea9368d7.png';

const salesData = [
  { day: 'Mon', sales: 65000 },
  { day: 'Tue', sales: 72000 },
  { day: 'Wed', sales: 68000 },
  { day: 'Thu', sales: 80000 },
  { day: 'Fri', sales: 85000 },
  { day: 'Sat', sales: 92000 },
  { day: 'Sun', sales: 88000 },
];

const categoryData = [
  { name: 'Chicken', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Paneer', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Biryani', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Desserts', value: 15, color: 'hsl(var(--chart-4))' },
  { name: 'Others', value: 5, color: 'hsl(var(--chart-5))' },
];

const topDishes = [
  { name: 'Paneer Butter Masala', orders: 42, image: paneerImage },
  { name: 'Chicken Biryani', orders: 38, image: biryaniImage },
  { name: 'Masala Dosa', orders: 35, image: dosaImage },
];

export default function Dashboard() {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Hello Charan,</h1>
              <p className="text-lg text-muted-foreground">ready to thrive today?</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <Card className="p-6 bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-chart-2/20 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Insights</h3>
              <p className="text-muted-foreground mt-1">
                Your sales increased by 12% this week. Best-selling item: <span className="font-semibold text-foreground">Paneer Butter Masala</span>
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Sales Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Outlet Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-muted-foreground">{cat.name} ({cat.value}%)</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Top Selling Dishes Today</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topDishes.map((dish, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                <img src={dish.image} alt={dish.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-medium">{dish.name}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">{dish.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
