import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LuBedDouble } from 'react-icons/lu';
import { describe, expect, test } from 'vitest';

import { DashboardEmptyState } from '../features/dashboard/components/DashboardEmptyState';
import { DashboardStatCard } from '../features/dashboard/components/DashboardStatCard';
import { DashboardWelcome } from '../features/dashboard/components/DashboardWelcome';
import { QuickActionCard } from '../features/dashboard/components/QuickActionCard';

describe('shared dashboard components', () => {
  test('renders the dashboard title and welcome information', () => {
    render(
      <DashboardWelcome
        dateLabel="27 July 2026"
        message="View your hostel information."
        name="Test Student"
        roleLabel="Student"
        title="Student Dashboard"
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Student Dashboard' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Welcome, Test Student/)).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
  });

  test('uses the configured route for a quick action', () => {
    render(
      <MemoryRouter>
        <QuickActionCard
          description="Open your room information."
          Icon={LuBedDouble}
          path="/student/room"
          title="View room allocation"
        />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('link', { name: /View room allocation/ })
    ).toHaveAttribute('href', '/student/room');
  });

  test('does not invent a number when summary data is unavailable', () => {
    render(
      <DashboardStatCard Icon={LuBedDouble} title="Rooms" tone="primary" />
    );

    expect(screen.getByText('Not available yet')).toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  test('renders dashboard loading and empty states safely', () => {
    const { rerender } = render(
      <DashboardStatCard
        Icon={LuBedDouble}
        isLoading
        title="Rooms"
        tone="primary"
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading Rooms');

    rerender(
      <DashboardEmptyState
        description="Room information will appear later."
        title="No room information"
      />
    );

    expect(screen.getByText('No room information')).toBeInTheDocument();
  });
});
