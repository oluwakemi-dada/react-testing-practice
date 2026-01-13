import { render, screen } from '@testing-library/react';
import SearchBox from '../../src/components/SearchBox';
import userEvent from '@testing-library/user-event';

describe('SearchBox', () => {
  const renderSearchBox = () => {
    const onChange = vi.fn();
    render(<SearchBox onChange={onChange} />);

    return {
      input: screen.getByPlaceholderText(/search/i),
      user: userEvent.setup(),
      onChange,
    };
  };

  it('should render an input field for searching', () => {
    const { input } = renderSearchBox();

    expect(input).toBeInTheDocument();
  });

  it('should call onChange when enter is pressed', async () => {
    const { onChange, input, user } = renderSearchBox();

    const searchTerm = 'SearchTerm';
    await user.type(input, `${searchTerm}{Enter}`);

    expect(onChange).toHaveBeenCalledWith(searchTerm);
  });

  it('should not call onChange if input field is empty', async () => {
    const { onChange, input, user } = renderSearchBox();

    const searchTerm = '';
    await user.type(input, `${searchTerm}{Enter}`);

    expect(onChange).not.toHaveBeenCalled();
  });
});
