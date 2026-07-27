import { describe, expect, test } from 'vitest';

import {
  ACCESS_TOKEN_KEY,
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
} from '../utils/token-storage';

describe('token storage', () => {
  test('saves and reads an access token', () => {
    saveAccessToken('test-access-token');

    expect(getAccessToken()).toBe('test-access-token');
  });

  test('removes the access token', () => {
    saveAccessToken('test-access-token');
    removeAccessToken();

    expect(getAccessToken()).toBeNull();
  });

  test('ignores an empty token', () => {
    saveAccessToken('   ');

    expect(getAccessToken()).toBeNull();
  });

  test('does not store unrelated account information', () => {
    saveAccessToken('test-access-token');

    expect(window.sessionStorage.length).toBe(1);
    expect(window.sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBe(
      'test-access-token'
    );
    expect(window.sessionStorage.getItem('user')).toBeNull();
  });
});
