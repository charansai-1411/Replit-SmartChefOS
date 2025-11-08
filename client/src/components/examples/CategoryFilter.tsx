import { CategoryFilter } from '../CategoryFilter';
import { useState } from 'react';

export default function CategoryFilterExample() {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'Specials', 'Soups', 'Desserts', 'Chicken', 'Vegetarian', 'Rice'];

  return (
    <div className="p-4 bg-background">
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(category) => {
          setActiveCategory(category);
          console.log('Category changed to:', category);
        }}
      />
    </div>
  );
}
