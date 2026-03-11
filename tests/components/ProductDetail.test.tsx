import { http, HttpResponse } from 'msw';
import { render, screen } from '@testing-library/react';
import ProductDetail from '../../src/components/ProductDetail';
import { server } from '../mocks/server';
import { createProduct, db } from '../mocks/db';

describe('ProductDetail', () => {
  let productId: number;

  beforeAll(async () => {
    const product = await createProduct();
    productId = product.id;

    console.log('PRODUCTS!!!!', product);
  });

  afterAll(() => {
    db.product.delete((q) => q.where({ id: productId }));
  });

  it('should render product details', async () => {
    const product = db.product.findFirst((q) => q.where({ id: productId }));

    if (!product) {
      throw new Error('Product not found in test setup');
    }

    render(<ProductDetail productId={productId} />);

    expect(
      await screen.findByText(new RegExp(product.name)),
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

  it('should render an error if data fetching fails', async () => {
    server.use(http.get('/products/1', () => HttpResponse.error()));

    render(<ProductDetail productId={1} />);

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });
});
