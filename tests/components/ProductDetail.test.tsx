import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import ProductDetail from '../../src/components/ProductDetail';
import { server } from '../mocks/server';
import { createProduct, db } from '../mocks/db';

describe('ProductDetail', () => {
  let productId: number;

  beforeAll(async () => {
    const product = await createProduct();
    productId = product.id as number;
  });

  afterAll(() => {
    db.product.delete((q) => q.where({ id: productId }));
  });

  it('should render product details', async () => {
    const product = db.product.findFirst((q) => q.where({ id: productId }));

    render(<ProductDetail productId={productId} />);

    expect(
      await screen.findByText(new RegExp(product?.name as string)),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(new RegExp(product.price.toString())),
    ).toBeInTheDocument();
  });

  it('should render message if product not found', async () => {
    server.use(http.get('/products/1', () => HttpResponse.json(null)));

    render(<ProductDetail productId={1} />);

    const message = await screen.findByText(/not found/i);
    expect(message).toBeInTheDocument();
  });

  it('should render an error for invalid product id', async () => {
    render(<ProductDetail productId={0} />);

    const message = await screen.findByText(/invalid/i);
    expect(message).toBeInTheDocument();
  });
});
