import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SubtasksPage } from './SubtasksPage';

const { mockLoadAllResources, mockToggleSubtask, mockUseStore } = vi.hoisted(() => {
  const store = {
    work: {
      tasks: [
        {
          id: 't1',
          title: 'Build transformer',
          status: 'wip',
          order: 0,
          created_date: '2026-07-01',
          subtasks: [
            { id: 's1', label: 'Implement attention', done: false, order: 0, resourceIds: ['r1'] },
            { id: 's2', label: 'Write tests', done: true, order: 1 },
          ],
        },
        {
          id: 't2',
          title: 'Leetcode prep',
          status: 'todo',
          order: 1,
          created_date: '2026-07-10',
          subtasks: [
            { id: 's3', label: 'Two sum', done: false, order: 0 },
          ],
        },
      ],
    },
    toggleSubtask: vi.fn(),
  };
  const mockUseStore = vi.fn((selector?: (s: typeof store) => unknown) =>
    selector ? selector(store) : store
  );
  return { mockLoadAllResources: vi.fn(), mockToggleSubtask: store.toggleSubtask, mockUseStore };
});

vi.mock('../lib/store', () => ({
  useStore: mockUseStore,
}));

vi.mock('../lib/api', () => ({
  loadAllResources: mockLoadAllResources,
}));

const MOCK_RESOURCES = [
  { resource: { id: 'r1', label: 'Attention is All You Need', done: false, order: 0 }, clusterId: 'alpha' },
];

describe('SubtasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadAllResources.mockResolvedValue(MOCK_RESOURCES);
  });

  it('renders the page title and counts', async () => {
    render(
      <MemoryRouter>
        <SubtasksPage />
      </MemoryRouter>
    );
    expect(await screen.findByText('Subtasks')).toBeInTheDocument();
    expect(screen.getByText(/3 total/)).toBeInTheDocument();
    expect(screen.getByText(/1 linked/)).toBeInTheDocument();
    expect(screen.getByText(/2 unlinked/)).toBeInTheDocument();
  });

  it('renders subtasks grouped by task', async () => {
    render(
      <MemoryRouter>
        <SubtasksPage />
      </MemoryRouter>
    );
    expect(await screen.findByText('Implement attention')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
    expect(screen.getByText('Two sum')).toBeInTheDocument();
  });

  it('renders linked resource badges', async () => {
    render(
      <MemoryRouter>
        <SubtasksPage />
      </MemoryRouter>
    );
    expect(await screen.findByText('Attentio\u2026')).toBeInTheDocument();
  });

  it('hides done subtasks when toggle is off', async () => {
    render(
      <MemoryRouter>
        <SubtasksPage />
      </MemoryRouter>
    );
    const checkbox = await screen.findByLabelText('Show done');
    expect(checkbox).toBeChecked();
  });
});
