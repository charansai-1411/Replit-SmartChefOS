import { StatusChips } from '../StatusChips';
import { useState } from 'react';

export default function StatusChipsExample() {
  const [activeStatus, setActiveStatus] = useState('all');
  
  const counts = {
    all: 12,
    'dine-in': 5,
    waitlist: 2,
    takeaway: 3,
    served: 2,
  };

  return (
    <div className="p-4 bg-background">
      <StatusChips
        activeStatus={activeStatus}
        onStatusChange={(status) => {
          setActiveStatus(status);
          console.log('Status changed to:', status);
        }}
        counts={counts}
      />
    </div>
  );
}
