import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskDetailModal } from './TaskDetailModal';

const {
  mockAddSubtask,
  mockToggleSubtask,
  mockRemoveSubtask,
  mockReorderSubtasks,
  mockToggleSubtaskResource,
  mockUpdateWorkTaskStatus,
  mockUpdateWorkTask,
  mockUseStore,
  mockSuggestSubtasks,
} = vi.hoisted(() => ({
  mockAddSubtask: vi.fn(),
  mockToggleSubtask: vi.fn(),
  mockRemoveSubtask: vi.fn(),
  mockReorderSubtasks: vi.fn(),
  mockToggleSubtaskResource: vi.fn(),
  mockUpdateWorkTaskStatus: vi.fn(),
  mockUpdateWorkTask: vi.fn(),
  mockUseStore: vi.fn(),
  mockSuggestSubtasks: vi.fn(),
}));

vi.mock('../../lib/store', () => ({
  useStore: mockUseStore,
}));

vi.mock('../../lib/api', () => ({
  suggestSubtasks: mockSuggestSubtasks,
  loadAllResources: () => Promise.resolve([]),
}));

import { makeWorkTask } from '../../lib/test-fixtures';

beforeEach(() => {
  vi.clearAllMocks();
  mockUseStore.mockImplementation((selector: any) =>
    selector({
      updateWorkTaskStatus: mockUpdateWorkTaskStatus,
      updateWorkTask: mockUpdateWorkTask,
      addSubtask: mockAddSubtask,
      toggleSubtask: mockToggleSubtask,
      removeSubtask: mockRemoveSubtask,
      reorderSubtasks: mockReorderSubtasks,
      toggleSubtaskResource: mockToggleSubtaskResource,
    })
  );
  mockSuggestSubtasks.mockResolvedValue([]);
  mockAddSubtask.mockResolvedValue(undefined);
  mockToggleSubtask.mockResolvedValue(undefined);
  mockRemoveSubtask.mockResolvedValue(undefined);
  mockReorderSubtasks.mockResolvedValue(undefined);
  mockUpdateWorkTaskStatus.mockResolvedValue(undefined);
  mockUpdateWorkTask.mockResolvedValue(undefined);
});

const renderModal = (overrides: any = {}, onClose = vi.fn()) => {
  const task = makeWorkTask(overrides);
  const utils = render(<TaskDetailModal task={task} onClose={onClose} />);
  return { task, onClose, ...utils };
};

describe('TaskDetailModal', () => {
  it('renders hero with title, status pill, and progress label', () => {
    renderModal({ title: 'Refactor auth middleware' });
    expect(screen.getByTestId('task-title')).toHaveTextContent('Refactor auth middleware');
    expect(screen.getByTestId('task-status-pill')).toHaveTextContent('WIP');
  });

  it('shows progress count and percentage when subtasks exist', () => {
    renderModal({
      subtasks: [
        { id: 's1', label: 'A', done: true,  order: 0 },
        { id: 's2', label: 'B', done: false, order: 1 },
        { id: 's3', label: 'C', done: false, order: 2 },
        { id: 's4', label: 'D', done: true,  order: 3 },
      ],
    });
    expect(screen.getByTestId('task-progress')).toHaveTextContent('2/4 \u00b7 50%');
  });

  it('adds a subtask when typing in the input and pressing Enter', async () => {
    const user = userEvent.setup();
    renderModal();
    const input = screen.getByTestId('subtask-input');
    await user.type(input, 'Write tests');
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(mockAddSubtask).toHaveBeenCalledWith('w1', 'Write tests');
    });
  });

  it('toggles a subtask and updates progress', async () => {
    const user = userEvent.setup();
    renderModal({
      subtasks: [
        { id: 's1', label: 'A', done: false, order: 0 },
        { id: 's2', label: 'B', done: false, order: 1 },
      ],
    });
    expect(screen.getByTestId('task-progress')).toHaveTextContent('0/2 \u00b7 0%');
    const checkboxes = screen.getAllByTestId('subtask-checkbox');
    await user.click(checkboxes[0]);
    expect(mockToggleSubtask).toHaveBeenCalledWith('w1', 's1');
  });

  it('removes a subtask via the row remove button', async () => {
    const user = userEvent.setup();
    renderModal({
      subtasks: [
        { id: 's1', label: 'A', done: false, order: 0 },
        { id: 's2', label: 'B', done: false, order: 1 },
      ],
    });
    const removeButtons = screen.getAllByTestId('subtask-remove');
    await user.click(removeButtons[0]);
    expect(mockRemoveSubtask).toHaveBeenCalledWith('w1', 's1');
  });

  it('reorders subtasks via drag and drop (keyboard sensor)', async () => {
    const user = userEvent.setup();
    renderModal({
      subtasks: [
        { id: 's1', label: 'A', done: false, order: 0 },
        { id: 's2', label: 'B', done: false, order: 1 },
        { id: 's3', label: 'C', done: false, order: 2 },
      ],
    });
    const handles = screen.getAllByTestId('subtask-drag-handle');
    handles[2].focus();
    await user.keyboard(' ');
    await user.keyboard('{ArrowUp}');
    await user.keyboard(' ');

    await waitFor(() => {
      expect(mockReorderSubtasks).toHaveBeenCalled();
    });
    const calledWith = mockReorderSubtasks.mock.calls[0];
    expect(calledWith[0]).toBe('w1');
    const ids: string[] = calledWith[1];
    expect(ids).toHaveLength(3);
    expect([...ids].sort()).toEqual(['s1', 's2', 's3']);
    expect(ids.indexOf('s3')).not.toBe(2);
  });

  it('cycles status when pressing keys 1\u20135', () => {
    renderModal();
    fireEvent.keyDown(document, { key: '3' });
    expect(mockUpdateWorkTaskStatus).toHaveBeenCalledWith('w1', 'done');
    fireEvent.keyDown(document, { key: '4' });
    expect(mockUpdateWorkTaskStatus).toHaveBeenCalledWith('w1', 'stuck');
  });

  it('marks the task done on Cmd+Shift+Enter', () => {
    renderModal();
    fireEvent.keyDown(document, { key: 'Enter', metaKey: true, shiftKey: true });
    expect(mockUpdateWorkTaskStatus).toHaveBeenCalledWith('w1', 'done');
  });

  it('closes the modal when Esc is pressed', () => {
    const onClose = vi.fn();
    renderModal({}, onClose);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes the modal when clicking the overlay', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({}, onClose);
    const overlay = screen.getByTestId('task-modal-overlay');
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when clicking inside the modal', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({}, onClose);
    const modal = screen.getByTestId('task-modal');
    await user.click(modal);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('suggests subtasks via AI when the suggest button is clicked', async () => {
    const user = userEvent.setup();
    mockSuggestSubtasks.mockResolvedValue(['Spec signed off', 'Pull request open', 'Migration script']);
    renderModal({ title: 'Refactor auth' });
    const suggestBtn = screen.getByTestId('task-suggest-button');
    await user.click(suggestBtn);
    await waitFor(() => {
      expect(mockSuggestSubtasks).toHaveBeenCalledWith('Refactor auth', undefined);
    });
    await waitFor(() => {
      expect(mockAddSubtask).toHaveBeenCalledTimes(3);
    });
    expect(mockAddSubtask).toHaveBeenNthCalledWith(1, 'w1', 'Spec signed off');
    expect(mockAddSubtask).toHaveBeenNthCalledWith(2, 'w1', 'Pull request open');
    expect(mockAddSubtask).toHaveBeenNthCalledWith(3, 'w1', 'Migration script');
  });

  it('shows an error when the AI returns no subtasks', async () => {
    const user = userEvent.setup();
    mockSuggestSubtasks.mockResolvedValue([]);
    renderModal({ title: 'Refactor auth' });
    await user.click(screen.getByTestId('task-suggest-button'));
    await waitFor(() => {
      expect(screen.getByText(/AI unavailable/i)).toBeInTheDocument();
    });
  });

  it('renders the empty state with Break this down and Suggest button when no subtasks', () => {
    renderModal();
    expect(screen.getByText(/Break this down/i)).toBeInTheDocument();
    expect(screen.getByTestId('task-suggest-button')).toBeInTheDocument();
  });

  it('commits a new title when the title is edited and Enter is pressed', async () => {
    const user = userEvent.setup();
    renderModal({ title: 'Old title' });
    await user.click(screen.getByTestId('task-title'));
    const input = screen.getByTestId('task-title-input') as HTMLInputElement;
    await user.clear(input);
    await user.keyboard('New title');
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(mockUpdateWorkTask).toHaveBeenCalledWith('w1', { title: 'New title' });
    });
  });

  it('renders without crashing when all subtasks are done', () => {
    renderModal({
      subtasks: [
        { id: 's1', label: 'A', done: true, order: 0 },
        { id: 's2', label: 'B', done: true, order: 1 },
      ],
    });
    expect(screen.getByTestId('task-progress')).toHaveTextContent('2/2 \u00b7 100%');
  });

  it('displays the blocker in the context panel', () => {
    renderModal({ blocker: 'waiting on review' });
    expect(screen.getByText(/waiting on review/i)).toBeInTheDocument();
  });

  it('displays the due date in the context panel', () => {
    renderModal({ due: '2026-06-15' });
    expect(screen.getByText('2026-06-15')).toBeInTheDocument();
  });

  it('opens a date picker when the due date is clicked', async () => {
    const user = userEvent.setup();
    renderModal({ due: '2026-06-15' });
    await user.click(screen.getByTestId('task-due-button'));
    expect(screen.getByTestId('task-due-input')).toBeInTheDocument();
  });

  it('commits a new due date when the date input changes', async () => {
    const user = userEvent.setup();
    renderModal({ due: '2026-06-15' });
    await user.click(screen.getByTestId('task-due-button'));
    const input = screen.getByTestId('task-due-input');
    fireEvent.change(input, { target: { value: '2026-07-20' } });
    expect(mockUpdateWorkTask).toHaveBeenCalledWith('w1', { due: '2026-07-20' });
  });

  it('clears the due date when the clear button is clicked', async () => {
    const user = userEvent.setup();
    renderModal({ due: '2026-06-15' });
    await user.click(screen.getByTestId('task-due-clear'));
    expect(mockUpdateWorkTask).toHaveBeenCalledWith('w1', { due: undefined });
  });

  it('shows an "Add due…" affordance when no due date is set', () => {
    renderModal({ due: undefined });
    expect(screen.getByTestId('task-due-button')).toHaveTextContent(/add due/i);
    expect(screen.queryByTestId('task-due-clear')).not.toBeInTheDocument();
  });

  it('displays the git_repo in the context panel', () => {
    renderModal({ git_repo: '/Users/test/Dev/my-repo' });
    expect(screen.getByText(/\/Users\/test\/Dev\/my-repo/)).toBeInTheDocument();
  });
});
