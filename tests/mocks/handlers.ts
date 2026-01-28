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
    return HttpResponse.json(product);
  }),
];
