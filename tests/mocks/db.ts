import { Collection } from '@msw/data';
import { z } from 'zod';
import { faker } from '@faker-js/faker';

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  categoryId: z.number(),
});

export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;

export const db = {
  category: new Collection({ schema: categorySchema }),
  product: new Collection({ schema: productSchema }),
};

export const createCategory = async (overrides: Partial<Category> = {}) => {
  return await db.category.create({
    id: faker.number.int(),
    name: faker.commerce.department(),
    ...overrides,
  });
};

export const createProduct = (overrides: Partial<Product> = {}) => {
  return db.product.create({
    id: faker.number.int(),
    name: faker.commerce.productName(),
    price: faker.number.int({ min: 1, max: 100 }),
    categoryId: faker.number.int(),
    ...overrides,
  });
};

export const getProductsByCategory = (categoryId: number) =>
  db.product.findMany((q) => q.where({ categoryId }));

export const getCategoryWithProducts = (categoryId: number) => {
  const category = db.category.findFirst((q) => q.where({ id: categoryId }));
  if (!category) return null;

  const products = getProductsByCategory(categoryId);
  return { ...category, products };
};
