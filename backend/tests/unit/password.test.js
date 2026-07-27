const { hashPassword, comparePassword } = require('../../src/utils/password');

describe('password utilities', () => {
  test('hashes a password and verifies the correct value', async () => {
    const plainPassword = 'Student123';
    const passwordHash = await hashPassword(plainPassword);

    expect(passwordHash).not.toBe(plainPassword);
    expect(passwordHash).not.toContain(plainPassword);
    await expect(comparePassword(plainPassword, passwordHash)).resolves.toBe(
      true
    );
  });

  test('rejects an incorrect password', async () => {
    const passwordHash = await hashPassword('Student123');

    await expect(comparePassword('Incorrect123', passwordHash)).resolves.toBe(
      false
    );
  });
});
