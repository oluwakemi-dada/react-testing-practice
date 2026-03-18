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
];
