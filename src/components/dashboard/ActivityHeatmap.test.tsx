import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityHeatmap } from './ActivityHeatmap';
import { makeLog, TODAY, TODAY_STR } from '../../lib/test-fixtures';

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(TODAY); });
afterEach(() => { vi.useRealTimers(); });

describe('ActivityHeatmap', () => {
  it('renders without crashing with empty logs', () => {
    const { container } = render(<ActivityHeatmap logs={[]} />);
    expect(container).toBeTruthy();
  });

  it('renders exactly 365 cells', () => {
    const { container } = render(<ActivityHeatmap logs={[]} />);
    const cells = container.querySelectorAll('.grid > [style*="background-color"]');
    expect(cells).toHaveLength(365);
  });

  it('shows the "ACTIVITY GRID" heading', () => {
    render(<ActivityHeatmap logs={[]} />);
    expect(screen.getByText('ACTIVITY GRID')).toBeInTheDocument();
  });

  it('shows legend labels', () => {
    render(<ActivityHeatmap logs={[]} />);
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });
});
