const { authorizeRoles } = require('../../src/middleware/authorize');

const runAuthorization = (allowedRoles, user) => {
  const next = jest.fn();
  const middleware = authorizeRoles(...allowedRoles);

  middleware({ user }, {}, next);
  return next;
};

describe('role authorization middleware', () => {
  test('allows Admin access when Admin is required', () => {
    const next = runAuthorization(['admin'], { role: 'admin' });

    expect(next).toHaveBeenCalledWith();
  });

  test('denies Student access when Admin is required', () => {
    const next = runAuthorization(['admin'], { role: 'student' });

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
  });

  test('allows Maintenance Staff in an approved role combination', () => {
    const next = runAuthorization(['admin', 'maintenance_staff'], {
      role: 'maintenance_staff',
    });

    expect(next).toHaveBeenCalledWith();
  });

  test('allows Security Staff in an approved role combination', () => {
    const next = runAuthorization(['admin', 'security_staff'], {
      role: 'security_staff',
    });

    expect(next).toHaveBeenCalledWith();
  });

  test('returns 401 when authentication has not run', () => {
    const next = runAuthorization(['admin'], undefined);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });
});
