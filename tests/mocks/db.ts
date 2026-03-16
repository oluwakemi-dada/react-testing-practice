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
  return db.category.create({
    id: faker.number.int(),
    name: faker.commerce.department(),
    ...overrides,
  });
};

// export const createProduct = async (overrides: Partial<Product> = {}) => {
//   return db.product.create({
//     id: faker.number.int(),
//     name: faker.commerce.productName(),
//     price: faker.number.int({ min: 1, max: 100 }),
//     ...overrides,
//     categoryId: faker.number.int(),
//   });
// };

export const createProduct = async (overrides: Partial<Product> = {}) => {
  // auto-create a category if none provided, so categoryId is always valid
  const categoryId = overrides.categoryId ?? (await createCategory()).id;

  return db.product.create({
    id: faker.number.int(),
    name: faker.commerce.productName(),
    price: faker.number.int({ min: 1, max: 100 }),
    ...overrides,
    categoryId, // 👈 resolved last so it's always correct
  });
};

export const getProductsByCategory = (categoryId: number) =>
  db.product.findMany((q) => q.where({ categoryId }));

export const getProductWithCategory = (productId: number) => {
  const product = db.product.findFirst((q) => q.where({ id: productId }));
  if (!product) return null;
  const category = db.category.findFirst((q) =>
    q.where({ id: product.categoryId }),
  );
  return { ...product, category };
};

export const getCategoryWithProducts = (categoryId: number) => {
  const category = db.category.findFirst((q) => q.where({ id: categoryId }));
  if (!category) return null;

  const products = getProductsByCategory(categoryId);
  return { ...category, products };
};
