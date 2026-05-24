import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SemanticLogger } from './SemanticLogger';

const { mockConfirmLogEntry, mockUseStore } = vi.hoisted(() => ({
  mockConfirmLogEntry: vi.fn(),
  mockUseStore: vi.fn(),
}));

vi.mock('../../lib/store', () => ({
  useStore: mockUseStore,
}));

const mockParseText = vi.hoisted(() => vi.fn());
vi.mock('../../lib/api', () => ({
  parseText: mockParseText,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseStore.mockReturnValue({
    confirmLogEntry: mockConfirmLogEntry,
    llmOnline: true,
  });
  mockParseText.mockResolvedValue(null);
});

const renderLogger = () => render(<SemanticLogger />);

describe('SemanticLogger', () => {
  it('is not visible by default', () => {
    renderLogger();
    expect(screen.queryByText('What did you work on?')).not.toBeInTheDocument();
  });

  it('opens on Cmd+K keyboard shortcut', async () => {
    renderLogger();
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', metaKey: true });
    });
    expect(screen.getByText('What did you work on?')).toBeInTheDocument();
  });

  it('opens when open-logger custom event is dispatched', async () => {
    renderLogger();
    await act(async () => {
      window.dispatchEvent(new CustomEvent('open-logger'));
    });
    expect(screen.getByText('What did you work on?')).toBeInTheDocument();
  });

  it('shows manual form immediately when llmOnline is false', async () => {
    mockUseStore.mockReturnValue({
      confirmLogEntry: mockConfirmLogEntry,
      llmOnline: false,
    });

    renderLogger();
    await act(async () => { fireEvent.keyDown(document, { key: 'k', metaKey: true }); });

    const textarea = screen.getByPlaceholderText(/freeform/i);
    await userEvent.type(textarea, 'worked on CUDA kernels');
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText(/Ollama offline/i)).toBeInTheDocument();
    });
  });

  it('transitions to preview state when LLM returns a result', async () => {
    mockParseText.mockResolvedValue({
      cluster_id: 'alpha',
      topic_guess: 'Triton kernel',
      hours: 2.0,
      is_completed: true,
    });

    renderLogger();
    await act(async () => { fireEvent.keyDown(document, { key: 'k', metaKey: true }); });

    const textarea = screen.getByPlaceholderText(/freeform/i);
    await userEvent.type(textarea, 'triton matmul kernel for 2 hours');
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Confirm log entry')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Triton kernel')).toBeInTheDocument();
  });

  it('transitions to manual state when LLM returns null', async () => {
    mockParseText.mockResolvedValue(null);

    renderLogger();
    await act(async () => { fireEvent.keyDown(document, { key: 'k', metaKey: true }); });

    const textarea = screen.getByPlaceholderText(/freeform/i);
    await userEvent.type(textarea, 'some work I did');
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Log session manually')).toBeInTheDocument();
    });
  });

  it('calls confirmLogEntry and closes dialog on confirm', async () => {
    mockParseText.mockResolvedValue({
      cluster_id: 'gamma',
      topic_guess: 'FreeRTOS',
      hours: 1.5,
      is_completed: false,
    });

    renderLogger();
    await act(async () => { fireEvent.keyDown(document, { key: 'k', metaKey: true }); });

    const textarea = screen.getByPlaceholderText(/freeform/i);
    await userEvent.type(textarea, 'FreeRTOS scheduler');
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => screen.getByText('Confirm log entry'));
    fireEvent.click(screen.getByText('Confirm \u21b5'));

    expect(mockConfirmLogEntry).toHaveBeenCalledOnce();
    const calledWith = mockConfirmLogEntry.mock.calls[0][0];
    expect(calledWith.cluster).toBe('gamma');
    expect(calledWith.topic).toBe('FreeRTOS');
    expect(calledWith.hours).toBe(1.5);
    expect(calledWith.source).toBe('manual');

    await waitFor(() => {
      expect(screen.queryByText('Confirm log entry')).not.toBeInTheDocument();
    });
  });
});
