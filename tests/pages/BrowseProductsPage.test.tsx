import { Theme } from '@radix-ui/themes';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import BrowseProducts from '../../src/pages/BrowseProductsPage';
import { CartProvider } from '../../src/providers/CartProvider';
import {
  Category,
  createCategory,
  createProduct,
  db,
  Product,
} from '../mocks/db';
import { server } from '../mocks/server';
import { simulateDelay, simulateError } from '../utils';

describe('BrowseProductsPage', () => {
  const categories: Category[] = [];
  const products: Product[] = [];

  beforeAll(async () => {
    const [createdCategories, createdProducts] = await Promise.all([
      Promise.all(
        Array.from({ length: 3 }, (_, i) =>
          createCategory({ id: i + 1, name: `Category ${i + 1}` }),
        ),
      ),
      Promise.all(
        Array.from({ length: 3 }, (_, i) => createProduct({ id: i + 1 })),
      ),
    ]);
    categories.push(...createdCategories);
    products.push(...createdProducts);
  });

  afterAll(() => {
    const categoryIds = categories.map((c) => c.id);
    db.category.deleteMany((q) =>
      q.where({ id: (id: number) => categoryIds.includes(id) }),
    );

    const productIds = products.map((p) => p.id);
    db.product.deleteMany((q) =>
      q.where({ id: (id: number) => productIds.includes(id) }),
    );
  });

  const renderComponent = () => {
    render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>,
    );

    return {
      getProductsSkeleton: () =>
        screen.queryByRole('progressbar', { name: /products/i }),
      getCategoriesSkeleton: () =>
        screen.queryByRole('progressbar', { name: /categories/i }),
    };
  };

  it('should show a loading skeleton when fetching categories', () => {
    simulateDelay('/categories');

    renderComponent();

    expect(
      screen.getByRole('progressbar', { name: /categories/i }),
    ).toBeInTheDocument();
  });

  it('should hide the loading skeleton after categories are fetched', async () => {
    const { getCategoriesSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);
  });

  it('should show a loading skeleton when fetching products', () => {
    simulateDelay('/products');

    renderComponent();

    expect(
      screen.getByRole('progressbar', { name: /products/i }),
    ).toBeInTheDocument();
  });

  it('should hide the loading skeleton after products are fetched', async () => {
    const { getProductsSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getProductsSkeleton);
  });

  it('should not render an error if categories cannot be fetched', async () => {
    simulateError('/categories');

    const { getCategoriesSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: /category/i }),
    ).not.toBeInTheDocument();
  });

  it('should render an error if products cannot be fetched', async () => {
    simulateError('/products');

    renderComponent();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it('should render categories', async () => {
    const { getCategoriesSkeleton } = renderComponent();

    await waitForElementToBeRemoved(getCategoriesSkeleton);

    const combobox = await screen.findByRole('combobox');
    expect(combobox).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(combobox);

    expect(screen.getByRole('option', { name: /all/i })).toBeInTheDocument();
    categories.forEach((category) => {
      expect(
        screen.getByRole('option', { name: category.name }),
      ).toBeInTheDocument();
    });
  });

  it('should render products', async () => {
    renderComponent();

    for (const product of products) {
      expect(await screen.findByText(product.name)).toBeInTheDocument();
    }
  });
});
