/**
 * Unit tests for isHttpUrl — security-critical URL validation guard.
 *
 * Run with: npx vitest run src/utils/__tests__/url.test.ts
 */
import { describe, it, expect } from 'vitest';
import { isHttpUrl } from '../url.js';

describe('isHttpUrl', () => {
  // ── Valid URLs ──

  it('accepts https URL', () => {
    expect(isHttpUrl('https://gitlab.example.com/org/repo/-/merge_requests/42')).toBe(true);
  });

  it('accepts http URL', () => {
    expect(isHttpUrl('http://example.com/path')).toBe(true);
  });

  it('accepts URL with unicode path segments', () => {
    expect(isHttpUrl('https://gitlab.example.com/%ED%95%9C%EA%B8%80/repo')).toBe(true);
  });

  it('accepts whitespace-padded URL after trim', () => {
    expect(isHttpUrl('  https://gitlab.example.com/mr/1  ')).toBe(true);
  });

  // ── XSS vectors ──

  it('rejects javascript: scheme', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
  });

  it('rejects data: scheme', () => {
    expect(isHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('rejects vbscript: scheme', () => {
    expect(isHttpUrl('vbscript:msgbox("xss")')).toBe(false);
  });

  // ── Edge cases ──

  it('rejects bare http:// with no host', () => {
    expect(isHttpUrl('http://')).toBe(false);
  });

  it('rejects bare https:// with no host', () => {
    expect(isHttpUrl('https://')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isHttpUrl('')).toBe(false);
  });

  it('rejects whitespace-only string', () => {
    expect(isHttpUrl('   ')).toBe(false);
  });

  // ── Non-string inputs (runtime safety) ──

  it('rejects undefined', () => {
    expect(isHttpUrl(undefined)).toBe(false);
  });

  it('rejects null', () => {
    expect(isHttpUrl(null)).toBe(false);
  });

  it('rejects number', () => {
    expect(isHttpUrl(123)).toBe(false);
  });
});
