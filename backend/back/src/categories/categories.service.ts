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
    this.categories = CATEGORIES_DATA.map((category, index) => ({
      id: String(index + 1),
      name: category.name,
      icon: category.icon,
    }));
  }

  findAll(): Category[] {
    return this.categories;
  }
}
