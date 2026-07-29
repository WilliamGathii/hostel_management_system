import { describe, expect, test } from 'vitest';

import {
  ACCESS_TOKEN_KEY,
  PASSWORD_CHANGE_TOKEN_KEY,
  getAccessToken,
  getPasswordChangeToken,
  removeAccessToken,
  removePasswordChangeToken,
  saveAccessToken,
  savePasswordChangeToken,
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

  test('stores and removes the restricted token separately', () => {
    savePasswordChangeToken('restricted-test-token');

    expect(getPasswordChangeToken()).toBe('restricted-test-token');
    expect(getAccessToken()).toBeNull();
    expect(window.sessionStorage.getItem(PASSWORD_CHANGE_TOKEN_KEY)).toBe(
      'restricted-test-token'
    );

    removePasswordChangeToken();
    expect(getPasswordChangeToken()).toBeNull();
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
