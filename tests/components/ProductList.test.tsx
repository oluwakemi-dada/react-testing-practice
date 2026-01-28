import { render, screen } from '@testing-library/react';
import ProductList from '../../src/components/ProductList';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { createProduct, db } from '../mocks/db';

describe('ProductList', () => {
  const productIds: number[] = [];

  beforeAll(async () => {
    const products = await Promise.all([1, 2, 3].map(() => createProduct()));
    productIds.push(...products.map((p) => p.id as number));
  });

  afterAll(() => {
    db.product.deleteMany((q) =>
      q.where({ id: (id: number) => productIds.includes(id) }),
    );
  });

  it('should render the list of products', async () => {
    render(<ProductList />);

    const items = await screen.findAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should render no products available if no product is found', async () => {
    server.use(http.get('/products', () => HttpResponse.json([])));

    render(<ProductList />);

    const message = await screen.findByText(/no products/i);
    expect(message).toBeInTheDocument();
  });
});
