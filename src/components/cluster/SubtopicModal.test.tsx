import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubtopicModal } from './SubtopicModal';

const {
  mockAddSubtopic,
  mockRemoveSubtopic,
  mockToggleSubtopic,
  mockUpdateSubtopic,
  mockReorderSubtopics,
  mockUseStore,
} = vi.hoisted(() => ({
  mockAddSubtopic: vi.fn(),
  mockRemoveSubtopic: vi.fn(),
  mockToggleSubtopic: vi.fn(),
  mockUpdateSubtopic: vi.fn(),
  mockReorderSubtopics: vi.fn(),
  mockUseStore: vi.fn(),
}));

vi.mock('../../lib/store', () => ({
  useStore: mockUseStore,
}));

const TOPIC = {
  id: 't1',
  label: 'Transformers',
  done: false,
  subtopics: [
    { id: 's1', label: 'Read paper', done: false, order: 0 },
    { id: 's2', label: 'Watch video', done: true, order: 1 },
    { id: 's3', label: 'Implement', done: false, order: 2 },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseStore.mockImplementation((selector: any) =>
    selector({
      addSubtopic: mockAddSubtopic,
      removeSubtopic: mockRemoveSubtopic,
      toggleSubtopic: mockToggleSubtopic,
      updateSubtopic: mockUpdateSubtopic,
      reorderSubtopics: mockReorderSubtopics,
    })
  );
  mockAddSubtopic.mockResolvedValue(undefined);
  mockRemoveSubtopic.mockResolvedValue(undefined);
  mockToggleSubtopic.mockResolvedValue(undefined);
  mockUpdateSubtopic.mockResolvedValue(undefined);
  mockReorderSubtopics.mockResolvedValue(undefined);
});

const renderModal = (props: any = {}, onClose = vi.fn()) => {
  const utils = render(
    <SubtopicModal clusterId="alpha" topic={TOPIC} onClose={onClose} {...props} />
  );
  return { onClose, ...utils };
};

describe('SubtopicModal', () => {
  it('renders the topic name and subtopic count', () => {
    renderModal();
    expect(screen.getByText('Transformers')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('displays subtopics from the topic', () => {
    renderModal();
    expect(screen.getByText('Read paper')).toBeInTheDocument();
    expect(screen.getByText('Watch video')).toBeInTheDocument();
    expect(screen.getByText('Implement')).toBeInTheDocument();
  });

  it('shows the empty state when no subtopics exist', () => {
    renderModal({
      topic: { ...TOPIC, subtopics: [] },
    });
    expect(screen.getByText(/Break this down/i)).toBeInTheDocument();
  });

  it('adds a subtopic when typing and pressing Enter', async () => {
    const user = userEvent.setup();
    renderModal();
    const input = screen.getByTestId('subtopic-input');
    await user.type(input, 'Write notes');
    await user.keyboard('{Enter}');
    await waitFor(() => {
      expect(mockAddSubtopic).toHaveBeenCalledWith('alpha', 't1', 'Write notes');
    });
  });

  it('toggles a subtopic via the checkbox', async () => {
    const user = userEvent.setup();
    renderModal();
    const checkboxes = screen.getAllByTestId('subtopic-checkbox');
    await user.click(checkboxes[0]);
    expect(mockToggleSubtopic).toHaveBeenCalledWith('alpha', 't1', 's1');
  });

  it('removes a subtopic via the remove button', async () => {
    const user = userEvent.setup();
    renderModal();
    const removeButtons = screen.getAllByTestId('subtopic-remove');
    await user.click(removeButtons[1]);
    expect(mockRemoveSubtopic).toHaveBeenCalledWith('alpha', 't1', 's2');
  });

  it('expands and collapses description editor', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getAllByTestId('subtopic-desc-toggle')[0]);
    expect(screen.getByTestId('subtopic-desc-input')).toBeInTheDocument();
    await user.click(screen.getAllByTestId('subtopic-desc-toggle')[0]);
    await waitFor(() => {
      expect(screen.queryByTestId('subtopic-desc-input')).not.toBeInTheDocument();
    });
  });

  it('saves description on blur', async () => {
    const user = userEvent.setup();
    renderModal();
    const toggleButtons = screen.getAllByTestId('subtopic-desc-toggle');
    await user.click(toggleButtons[0]);
    const descInput = screen.getByTestId('subtopic-desc-input');
    await user.clear(descInput);
    await user.type(descInput, 'Study multi-head attention');
    fireEvent.blur(descInput);
    await waitFor(() => {
      expect(mockUpdateSubtopic).toHaveBeenCalledWith('alpha', 't1', 's1', { description: 'Study multi-head attention' });
    });
  });

  it('reorders subtopics via keyboard sensor', async () => {
    const user = userEvent.setup();
    renderModal();
    const handles = screen.getAllByTestId('subtopic-drag-handle');
    handles[2].focus();
    await user.keyboard(' ');
    await user.keyboard('{ArrowUp}');
    await user.keyboard(' ');

    await waitFor(() => {
      expect(mockReorderSubtopics).toHaveBeenCalled();
    });
    const calledWith = mockReorderSubtopics.mock.calls[0];
    expect(calledWith[0]).toBe('alpha');
    expect(calledWith[1]).toBe('t1');
    const ids: string[] = calledWith[2];
    expect(ids).toHaveLength(3);
    expect([...ids].sort()).toEqual(['s1', 's2', 's3']);
    expect(ids.indexOf('s3')).not.toBe(2);
  });

  it('closes on Esc', () => {
    const onClose = vi.fn();
    renderModal({}, onClose);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes when clicking the overlay', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<SubtopicModal clusterId="alpha" topic={TOPIC} onClose={onClose} />);
    // The overlay is the root div, first child of document body
    const overlay = container.firstElementChild as HTMLElement;
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
