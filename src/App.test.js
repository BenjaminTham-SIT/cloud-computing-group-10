import { render, screen } from '@testing-library/react';
import App from './App';

test('renders forum heading', () => {
  render(<App />);
  const heading = screen.getByText(/Forum Topics/i);
  expect(heading).toBeInTheDocument();
});
