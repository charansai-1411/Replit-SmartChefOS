import { OrderCard } from '../OrderCard';

export default function OrderCardExample() {
  return (
    <div className="p-4 bg-background flex gap-4 overflow-x-auto">
      <OrderCard
        orderNumber="Order #F0027"
        table="Table 03"
        itemCount={8}
        status="In Kitchen"
        time="2 mins ago"
      />
      <OrderCard
        orderNumber="Order #F0028"
        table="Table 07"
        itemCount={3}
        status="Ready"
        time="Just Now"
      />
      <OrderCard
        orderNumber="Order #F0019"
        table="Table 09"
        itemCount={2}
        status="Wait List"
        time="25 mins ago"
      />
    </div>
  );
}
