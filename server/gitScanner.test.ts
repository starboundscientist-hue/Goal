import { describe, it, expect, vi, beforeEach } from 'vitest';
import { homedir } from 'os';

const { mockExistsSync, mockReaddirSync, mockStatSync, mockExecSync } = vi.hoisted(() => ({
  mockExistsSync: vi.fn(),
  mockReaddirSync: vi.fn(),
  mockStatSync: vi.fn(),
  mockExecSync: vi.fn(),
}));

vi.mock('fs', () => {
  const actual = { existsSync: () => false, readdirSync: () => [], statSync: () => ({}) };
  return {
    ...actual,
    default: { existsSync: mockExistsSync, readdirSync: mockReaddirSync, statSync: mockStatSync },
    existsSync: mockExistsSync,
    readdirSync: mockReaddirSync,
    statSync: mockStatSync,
  };
});

vi.mock('child_process', () => ({
  default: { execSync: mockExecSync },
  execSync: mockExecSync,
}));

import { scanRecentCommits } from './gitScanner';

beforeEach(() => { vi.clearAllMocks(); });

describe('scanRecentCommits', () => {
  it('returns empty array when DEV_ROOT does not exist', () => {
    mockExistsSync.mockReturnValue(false);
    const result = scanRecentCommits('/nonexistent', 'test@test.com');
    expect(result).toEqual([]);
  });

  it('finds a repo at root level when .git exists', () => {
    mockExistsSync.mockImplementation((p: any) => {
      if (p === '/Users/test/Dev') return true;
      if (p === '/Users/test/Dev/.git') return true;
      return false;
    });
    mockExecSync.mockReturnValue('add fused attention kernel\nfix memory leak');

    const result = scanRecentCommits('/Users/test/Dev', 'test@test.com');
    expect(result).toHaveLength(1);
    expect(result[0].repo).toBe('/Users/test/Dev');
    expect(result[0].commits).toEqual(['add fused attention kernel', 'fix memory leak']);
  });

  it('skips node_modules during traversal', () => {
    mockExistsSync.mockImplementation((p: any) => {
      if (p === '/Users/test/Dev') return true;
      if (p === '/Users/test/Dev/.git') return false;
      if (p === '/Users/test/Dev/my-project') return true;
      if (p === '/Users/test/Dev/my-project/.git') return true;
      return false;
    });
    mockReaddirSync.mockReturnValue(['node_modules', 'my-project']);
    mockStatSync.mockImplementation((p: any) => {
      if (p.includes('node_modules')) throw new Error('should not traverse');
      return { isDirectory: () => true };
    });
    mockExecSync.mockReturnValue('');

    expect(() => scanRecentCommits('/Users/test/Dev', 'test@test.com')).not.toThrow();
  });

  it('skips entries in EXCLUDE_DIRS', () => {
    mockExistsSync.mockImplementation((p: any) => {
      if (p === '/dev') return true;
      if (p === '/dev/.git') return false;
      return false;
    });
    mockReaddirSync.mockReturnValue(['dist', 'build', '.next', 'venv', '.venv', 'target'] as any);
    mockStatSync.mockImplementation(() => { throw new Error('should not traverse excluded dirs'); });

    expect(() => scanRecentCommits('/dev', 'test@test.com')).not.toThrow();
  });

  it('returns empty commits for a repo with no recent activity', () => {
    mockExistsSync.mockImplementation((p: any) => {
      if (p === '/Users/test/Dev') return true;
      if (p === '/Users/test/Dev/.git') return true;
      return false;
    });
    mockExecSync.mockReturnValue('');

    const result = scanRecentCommits('/Users/test/Dev', 'test@test.com');
    expect(result).toEqual([]);
  });

  it('handles execSync throwing (no commits, permission error) gracefully', () => {
    mockExistsSync.mockImplementation((p: any) => {
      if (p === '/dev') return true;
      if (p === '/dev/.git') return true;
      return false;
    });
    mockExecSync.mockImplementation(() => { throw new Error('not a git repo'); });

    expect(() => scanRecentCommits('/dev', 'test@test.com')).not.toThrow();
    expect(scanRecentCommits('/dev', 'test@test.com')).toEqual([]);
  });

  it('expands tilde ~ in the dev root path', () => {
    const expanded = `${homedir()}/Dev`;
    mockExistsSync.mockImplementation((p: any) => p === expanded || p === `${expanded}/.git`);
    mockExecSync.mockReturnValue('initial commit');

    const result = scanRecentCommits('~/Dev', 'test@test.com');
    expect(result).toHaveLength(1);
  });
});
