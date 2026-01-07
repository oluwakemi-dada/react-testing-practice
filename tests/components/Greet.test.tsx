import { render, screen } from '@testing-library/react';
import Greet from '../../src/components/Greet';

describe('Greet', () => {
  it('should render Hello with the name when name is provided', () => {
    render(<Greet name='Kemi' />);

    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/kemi/i);
  });

  it('should render Login button when name is not provided', () => {
    render(<Greet />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(/login/i);
  });
});
