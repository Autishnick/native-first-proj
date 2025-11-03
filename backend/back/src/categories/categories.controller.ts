import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/common/auth/guards/firebase-auth.guard';
import { Category } from './categories.entity';
import { CategoriesService } from './categories.service';

@UseGuards(FirebaseAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Category[] {
    return this.categoriesService.findAll();
  }
}
