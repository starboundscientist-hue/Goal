import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NorthStarCard } from './NorthStarCard';

const mockFetch = vi.fn();

const MOCK_DATA = {
  northStar:
    'Build rare, **high-ground** expertise at the intersection of frontier AI and embodied systems.\n\n> That is not a race to the bottom. That is the summit.',
  entries: [
    {
      date: '2026-07-10',
      body: '**Context:** Org change at work.\n\n**Realignment:** Keep climbing.'
    },
    {
      date: '2026-07-11',
      body: '**Context:** Second entry.\n\n**Small wins carried forward:**\n- transformer from scratch\n- C++ lectures'
    }
  ]
};

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('NorthStarCard', () => {
  it('renders the north star text with bold formatting', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => MOCK_DATA });
    render(<NorthStarCard />);
    expect(await screen.findByText(/high-ground/)).toBeInTheDocument();
    expect(screen.getByText(/at the intersection of frontier AI/)).toBeInTheDocument();
  });

  it('renders the blockquote line', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => MOCK_DATA });
    render(<NorthStarCard />);
    expect(await screen.findByText(/That is the summit/)).toBeInTheDocument();
  });

  it('renders only the latest timeline entry', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => MOCK_DATA });
    render(<NorthStarCard />);
    expect(await screen.findByText(/2026-07-11/)).toBeInTheDocument();
    expect(screen.getByText(/transformer from scratch/)).toBeInTheDocument();
    expect(screen.queryByText(/2026-07-10/)).not.toBeInTheDocument();
  });

  it('renders nothing when the fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('network down'));
    const { container } = render(<NorthStarCard />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('renders nothing when the server responds with an error status', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404, json: async () => ({ error: 'not found' }) });
    const { container } = render(<NorthStarCard />);
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it('omits the timeline section when there are no entries', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ northStar: 'Just the why.', entries: [] })
    });
    render(<NorthStarCard />);
    expect(await screen.findByText('Just the why.')).toBeInTheDocument();
    expect(screen.queryByText(/Latest ·/)).not.toBeInTheDocument();
  });
});
