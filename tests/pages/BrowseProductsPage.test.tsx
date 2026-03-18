import { Theme } from '@radix-ui/themes';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrowseProducts from '../../src/pages/BrowseProductsPage';
import { CartProvider } from '../../src/providers/CartProvider';
import {
  Category,
  createCategory,
  createProduct,
  db,
  getProductsByCategory,
  Product,
} from '../mocks/db';
import { simulateDelay, simulateError } from '../utils';

describe('BrowseProductsPage', () => {
  const categories: Category[] = [];
  const products: Product[] = [];

  beforeAll(async () => {
    const createdCategories = await Promise.all(
      [1, 2].map((item) => createCategory({ name: `Category ${item}` })),
    );
    categories.push(...createdCategories);

    const createdProducts = await Promise.all(
      createdCategories.flatMap((category) =>
        [1, 2].map(() => createProduct({ categoryId: category.id })),
      ),
    );
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

  it('should filter products by category', async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderComponent();

    const selectedCategory = categories[0];
    await selectCategory(selectedCategory.name);

    const products = getProductsByCategory(selectedCategory.id);
    expectProductsToBeInTheDocument(products);
  });

  it('should render all products if All category is selected', async () => {
    const { selectCategory, expectProductsToBeInTheDocument } =
      renderComponent();

    await selectCategory(/all/i);

    const products = db.product.findMany();
    expectProductsToBeInTheDocument(products);
  });

  // Utils
  const renderComponent = () => {
    render(
      <CartProvider>
        <Theme>
          <BrowseProducts />
        </Theme>
      </CartProvider>,
    );

    const getProductsSkeleton = () =>
      screen.queryByRole('progressbar', { name: /products/i });

    const getCategoriesSkeleton = () =>
      screen.queryByRole('progressbar', { name: /categories/i });

    const selectCategory = async (name: RegExp | string) => {
      await waitForElementToBeRemoved(getCategoriesSkeleton);
      const combobox = screen.getByRole('combobox');
      const user = userEvent.setup();
      await user.click(combobox);

      const option = screen.getByRole('option', {
        name,
      });
      await user.click(option);
    };

    const expectProductsToBeInTheDocument = (products: Product[]) => {
      const rows = screen.getAllByRole('row');
      const dataRows = rows.slice(1);
      expect(dataRows).toHaveLength(products.length);

      products.forEach((product) => {
        expect(screen.getByText(product.name)).toBeInTheDocument();
      });
    };

    return {
      getProductsSkeleton,
      getCategoriesSkeleton,
      selectCategory,
      expectProductsToBeInTheDocument,
    };
  };
});
