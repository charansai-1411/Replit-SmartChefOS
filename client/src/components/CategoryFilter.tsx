import { Badge } from "@/components/ui/badge";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Badge
          key={category}
          variant={activeCategory === category ? "default" : "secondary"}
          className="rounded-full px-4 py-2 cursor-pointer whitespace-nowrap hover-elevate active-elevate-2"
          onClick={() => onCategoryChange(category)}
          data-testid={`category-${category.toLowerCase()}`}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
}
