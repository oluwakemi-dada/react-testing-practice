import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { Product } from '../../src/entities';
import { createProduct, db } from '../mocks/db';
import { navigateTo } from '../utils';

describe('ProductDetailPage', () => {
  let product: Product;

  beforeAll(async () => {
    product = await createProduct();
  });

  afterAll(() => {
    db.product.delete((q) => q.where({ id: product.id }));
  });

  it('should render product details', async () => {
    navigateTo('/products/' + product.id);
    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
    expect(
      screen.getByRole('heading', { name: product.name }),
    ).toBeInTheDocument();
    expect(screen.getByText('$' + product.price)).toBeInTheDocument();
  });
});
