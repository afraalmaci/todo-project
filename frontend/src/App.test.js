import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the login page by default', () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /log in/i });
  expect(button).toBeInTheDocument();
});
