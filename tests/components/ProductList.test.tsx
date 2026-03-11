import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import ProductList from '../../src/components/ProductList';
import { server } from '../mocks/server';
import { http, HttpResponse, delay } from 'msw';
import { createProduct, db } from '../mocks/db';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('ProductList', () => {
  const productIds: number[] = [];

  beforeAll(async () => {
    const products = await Promise.all(
      Array.from({ length: 3 }, () => createProduct()),
    );

    productIds.push(...products.map((p) => p.id));
  });

  afterAll(() => {
    db.product.deleteMany((q) =>
      q.where({ id: (id: number) => productIds.includes(id) }),
    );
  });

  const renderComponent = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ProductList />
      </QueryClientProvider>,
    );
  };

  it('should render the list of products', async () => {
    renderComponent();

    const items = await screen.findAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should render no products available if no product is found', async () => {
    server.use(http.get('/products', () => HttpResponse.json([])));

    renderComponent();

    const message = await screen.findByText(/no products/i);
    expect(message).toBeInTheDocument();
  });

  it('should render an error message when there is an error', async () => {
    server.use(http.get('/products', () => HttpResponse.error()));

    renderComponent();

    expect(await screen.findByText(/error/i)).toBeInTheDocument();
  });

  it('should render a loading indicator when fetching data', async () => {
    server.use(
      http.get('/products', async () => {
        await delay();
        return HttpResponse.json([]);
      }),
    );

    renderComponent();

    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });

  it('should remove the loading indicator after the data is fetched', async () => {
    renderComponent();

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });

  it('should remove loading indicator if data fetching fails', async () => {
    server.use(http.get('/products', () => HttpResponse.error()));

    renderComponent();

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  });
});
