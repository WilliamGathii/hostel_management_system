const migration = require('../../../database/migrations/1785150000007_add-required-password-change.cjs');

describe('first-login password-change migration', () => {
  test('adds safe defaults without locking existing accounts', () => {
    const pgm = {
      addColumns: jest.fn(),
      addConstraint: jest.fn(),
    };

    migration.up(pgm);

    expect(pgm.addColumns).toHaveBeenCalledWith(
      'users',
      expect.objectContaining({
        must_change_password: expect.objectContaining({
          default: false,
          notNull: true,
        }),
        password_changed_at: { type: 'timestamptz' },
        token_version: expect.objectContaining({
          default: 0,
          notNull: true,
        }),
      })
    );
  });
});
