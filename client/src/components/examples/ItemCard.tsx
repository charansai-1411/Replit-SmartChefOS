import { ItemCard } from '../ItemCard';
import paneerImage from '@assets/generated_images/Paneer_Butter_Masala_dish_80e08089.png';

export default function ItemCardExample() {
  return (
    <div className="p-4 bg-background grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
      <ItemCard
        id="1"
        name="Paneer Butter Masala"
        price={320}
        image={paneerImage}
        veg={true}
        available={true}
        onQuantityChange={(id, qty) => console.log(`Dish ${id} quantity:`, qty)}
      />
      <ItemCard
        id="2"
        name="Chicken Biryani"
        price={450}
        image={paneerImage}
        veg={false}
        available={true}
        onQuantityChange={(id, qty) => console.log(`Dish ${id} quantity:`, qty)}
      />
      <ItemCard
        id="3"
        name="Dal Makhani"
        price={280}
        image={paneerImage}
        veg={true}
        available={false}
        onQuantityChange={(id, qty) => console.log(`Dish ${id} quantity:`, qty)}
      />
    </div>
  );
}
