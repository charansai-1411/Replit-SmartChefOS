import { DishManagementCard } from '../DishManagementCard';
import paneerImage from '@assets/generated_images/Paneer_Butter_Masala_dish_80e08089.png';

export default function DishManagementCardExample() {
  return (
    <div className="p-4 bg-background grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
      <DishManagementCard
        id="1"
        name="Paneer Butter Masala"
        price={320}
        category="Paneer"
        image={paneerImage}
        veg={true}
        available={true}
        onToggleAvailability={(id, available) => console.log(`Dish ${id} availability:`, available)}
        onEdit={(id) => console.log('Edit dish:', id)}
        onDelete={(id) => console.log('Delete dish:', id)}
      />
      <DishManagementCard
        id="2"
        name="Chicken Biryani"
        price={450}
        category="Biryani"
        image={paneerImage}
        veg={false}
        available={false}
        onToggleAvailability={(id, available) => console.log(`Dish ${id} availability:`, available)}
        onEdit={(id) => console.log('Edit dish:', id)}
        onDelete={(id) => console.log('Delete dish:', id)}
      />
    </div>
  );
}
