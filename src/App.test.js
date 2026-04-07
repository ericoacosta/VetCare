  import { render, screen } from '@testing-library/react';
import App from './App';

test('renders PawCare Booking title', () => {
  render(<App />);
  const titleElement = screen.getByText(/PawCare Booking/i);
  expect(titleElement).toBeInTheDocument();
});cd forntend-backend-demo