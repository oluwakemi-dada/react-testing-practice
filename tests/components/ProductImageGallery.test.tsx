import { render, screen } from '@testing-library/react';
import ProductImageGallery from '../../src/components/ProductImageGallery';

describe('ProductImageGallery', () => {
  it('should render nothing if given an empty array', () => {
    const { container } = render(<ProductImageGallery imageUrls={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render a list of images', () => {
    const imageUrls: string[] = ['image-url-2', 'image-url-3', 'image-url-1'];

    render(<ProductImageGallery imageUrls={imageUrls} />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(images.length);

    images.forEach((image, index) => {
      expect(image).toHaveAttribute('src', imageUrls[index]);
    });
  });
});
