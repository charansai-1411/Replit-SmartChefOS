import { Badge } from "@/components/ui/badge";

interface StatusChipsProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  counts: Record<string, number>;
}

const statuses = [
  { label: "All", value: "all" },
  { label: "Dine-in", value: "dine-in" },
  { label: "Waitlist", value: "waitlist" },
  { label: "Takeaway", value: "takeaway" },
  { label: "Served", value: "served" },
];

export function StatusChips({ activeStatus, onStatusChange, counts }: StatusChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {statuses.map((status) => (
        <Badge
          key={status.value}
          variant={activeStatus === status.value ? "default" : "outline"}
          className="rounded-full px-4 py-2 cursor-pointer whitespace-nowrap hover-elevate active-elevate-2"
          onClick={() => onStatusChange(status.value)}
          data-testid={`chip-${status.value}`}
        >
          {status.label} {counts[status.value] > 0 && `(${counts[status.value]})`}
        </Badge>
      ))}
    </div>
  );
}
