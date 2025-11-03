// Per your request, all code and comments are in English.
import { Injectable } from '@nestjs/common';
import { Category } from './categories.entity';

const CATEGORIES_DATA = [
  { name: 'HandyMan', icon: 'tools' },
  { name: 'Electrician', icon: 'power-plug' },
  { name: 'Construction Cleaning', icon: 'broom' },
  { name: 'Painter', icon: 'format-paint' },
  { name: 'Home Cleaning', icon: 'vacuum' },
  { name: 'Gardening', icon: 'flower-tulip' },
  { name: 'Flooring', icon: 'layers-outline' },
  { name: 'Air Condition technician', icon: 'air-conditioner' },
];

@Injectable()
export class CategoriesService {
  private readonly categories: Category[];

  constructor() {
    // Convert the raw data into the Category[] type by adding IDs
    this.categories = CATEGORIES_DATA.map((category, index) => ({
      id: String(index + 1), // Create a unique ID (e.g., "1", "2", ...)
      name: category.name,
      icon: category.icon,
    }));
  }

  findAll(): Category[] {
    // Return the full list with IDs
    return this.categories;
  }
}
