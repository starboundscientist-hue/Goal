import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ClusterCard } from './ClusterCard';
import { ALPHA_CLUSTER, makeLog, TODAY, TODAY_STR } from '../../lib/test-fixtures';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TODAY);
});

afterEach(() => {
  vi.useRealTimers();
});

const renderCard = (overrides = {}) =>
  render(
    <MemoryRouter>
      <ClusterCard cluster={{ ...ALPHA_CLUSTER, ...overrides }} logs={[]} />
    </MemoryRouter>
  );

describe('ClusterCard', () => {
  it('renders the cluster name', () => {
    renderCard();
    expect(screen.getByText('Frontier AI/ML')).toBeInTheDocument();
  });

  it('renders the progress percentage', () => {
    renderCard();
    expect(screen.getByText('35%')).toBeInTheDocument();
  });

  it('shows "Not started" status when no logs exist', () => {
    renderCard();
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('shows "Active" status when there is a recent log', () => {
    const logs = [makeLog({ cluster: 'alpha', date: TODAY_STR })];
    render(
      <MemoryRouter>
        <ClusterCard cluster={ALPHA_CLUSTER} logs={logs} />
      </MemoryRouter>
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('navigates to the cluster page on click', () => {
    renderCard();
    fireEvent.click(screen.getByText('Frontier AI/ML'));
    expect(mockNavigate).toHaveBeenCalledWith('/cluster/alpha');
  });

  it('renders three checklist dots', () => {
    const { container } = renderCard();
    const dots = container.querySelectorAll('.w-2.h-2.rounded-full');
    expect(dots).toHaveLength(3);
  });

  it('checklist dots reflect done state correctly', () => {
    const cluster = { ...ALPHA_CLUSTER, checklist: { study: true, experiment: false, artifact: false } };
    const { container } = render(
      <MemoryRouter><ClusterCard cluster={cluster} logs={[]} /></MemoryRouter>
    );
    const dots = container.querySelectorAll('.w-2.h-2.rounded-full');
    expect(dots[0]).toHaveClass('bg-emerald-400/80');
    expect(dots[1]).toHaveClass('bg-surface-muted/40');
    expect(dots[2]).toHaveClass('bg-surface-muted/40');
  });
});
