import { Collection } from '@msw/data';
import { z } from 'zod';
import { faker } from '@faker-js/faker';

const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
});

export type Product = z.infer<typeof productSchema>;

export const db = {
  product: new Collection({
    schema: productSchema,
  }),
};

export const createProduct = async (overrides: Partial<Product> = {}) => {
  return await db.product.create({
    id: faker.number.int(),
    name: faker.commerce.productName(),
    price: faker.number.int({ min: 1, max: 100 }),
    ...overrides,
  });
};
