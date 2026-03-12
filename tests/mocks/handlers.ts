import { http, HttpResponse } from 'msw';
import { db } from './db';

export const handlers = [
  http.get('/products', () => {
    const products = db.product.findMany((q) => q.where({}));
    return HttpResponse.json(products);
  }),

  http.get('/products/:id', ({ params }) => {
    const product = db.product.findFirst((q) =>
      q.where({ id: Number(params.id) }),
    );
    if (!product) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(product);
  }),

  http.get('/categories', () => {
    const categories = db.category.findMany((q) => q.where({}));
    return HttpResponse.json(categories);
  }),

  // http.get('/categories/:id', ({ params }) => {
  //   const result = getCategoryWithProducts(Number(params.id));
  //   if (!result) return new HttpResponse(null, { status: 404 });
  //   return HttpResponse.json(result);
  // }),

  // http.post('/categories', async ({ request }) => {
  //   const body = await request.json();
  //   const parsed = categorySchema.safeParse(body);
  //   if (!parsed.success) return new HttpResponse(null, { status: 400 });
  //   const category = db.category.create(parsed.data);
  //   return HttpResponse.json(category, { status: 201 });
  // }),

  // http.get('/categories/:id/products', ({ params }) => {
  //   const products = getProductsByCategory(Number(params.id));
  //   return HttpResponse.json(products);
  // }),

  // http.post('/products', async ({ request }) => {
  //   const body = await request.json();
  //   const parsed = productSchema.safeParse(body);
  //   if (!parsed.success) return new HttpResponse(null, { status: 400 });
  //   const product = db.product.create(parsed.data);
  //   return HttpResponse.json(product, { status: 201 });
  // }),
];
