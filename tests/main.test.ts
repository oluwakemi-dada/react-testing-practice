import { it, describe } from 'vitest';
import { createProduct, db } from './mocks/db';

describe('group', () => {
  it('should', async () => {
    const product = await createProduct({ name: 'Apple' });
    console.log('product', product);

    const deletedProduct = db.product.delete((q) =>
      q.where({ id: product.id }),
    );
    console.log('deleted', deletedProduct);
  });
});
