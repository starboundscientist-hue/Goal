import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SprintsPage } from './SprintsPage';

const mockFetch = vi.fn();

const MOCK_DATA = {
  backlog: [
    { id: 'bg1', label: 'Read FlashAttention-3 paper', lane: 'papers', status: 'not_started' },
  ],
  sprints: [
    {
      id: 'sprint_1',
      name: 'Sprint 1',
      startDate: '2026-07-21',
      endDate: '2026-08-03',
      goals: [
        { id: 'g1', label: 'Quantize the transformer', lane: 'main', status: 'not_started' },
        { id: 'g2', label: 'Neetcode arrays', lane: 'dsa', status: 'done' },
        { id: 'g3', label: 'PR to vLLM docs', lane: 'opensource', status: 'in_progress' },
      ],
      closed: false,
    },
    {
      id: 'sprint_0',
      name: 'Sprint 0',
      startDate: '2026-07-07',
      endDate: '2026-07-20',
      goals: [{ id: 'g0', label: 'Old goal', lane: 'main', status: 'done' }],
      closed: true,
    },
  ],
};

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SprintsPage', () => {
  it('renders the loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<SprintsPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the current sprint with goals after load', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => MOCK_DATA });
    render(<SprintsPage />);
    expect(await screen.findByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText(/Quantize the transformer/)).toBeInTheDocument();
    expect(screen.getByText(/Neetcode arrays/)).toBeInTheDocument();
  });

  it('shows progress percentage and counts', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => MOCK_DATA });
    render(<SprintsPage />);
    expect(await screen.findByText('33%')).toBeInTheDocument();
    expect(screen.getByText('1/3 goals')).toBeInTheDocument();
  });

  it('renders archived sprints section', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => MOCK_DATA });
    render(<SprintsPage />);
    expect(await screen.findByText('Past sprints')).toBeInTheDocument();
    expect(screen.getByText('Sprint 0')).toBeInTheDocument();
  });

  it('renders the backlog with goals', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => MOCK_DATA });
    render(<SprintsPage />);
    expect(await screen.findByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText(/FlashAttention/)).toBeInTheDocument();
  });

  it('shows empty state for current sprint with no goals', async () => {
    const noGoals = {
      ...MOCK_DATA,
      sprints: [{
        ...MOCK_DATA.sprints[0],
        goals: [],
      }].concat(MOCK_DATA.sprints.slice(1)),
    };
    mockFetch.mockResolvedValue({ ok: true, json: async () => noGoals });
    render(<SprintsPage />);
    expect(await screen.findByText(/Pull goals from the backlog/)).toBeInTheDocument();
  });
});
