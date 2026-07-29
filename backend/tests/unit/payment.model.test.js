const paymentModel = require('../../src/models/payment.model');

const options = {
  page: 1,
  limit: 20,
  search: '',
  status: '',
  studentId: '33333333-3333-4333-8333-333333333333',
  roomId: '',
  dateFrom: '',
  dateTo: '',
};

describe('payment model filters', () => {
  test('uses the selected Student profile identifier in parameterized queries', async () => {
    const database = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };

    await paymentModel.listPayments(options, database);

    const [sql, values] = database.query.mock.calls[0];
    expect(sql).toContain('p.student_id = $1');
    expect(values[0]).toBe(options.studentId);
    expect(sql).not.toContain(options.studentId);
  });

  test('searches Student email without exposing credentials', async () => {
    const database = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };

    await paymentModel.listPayments(
      { ...options, studentId: '', search: 'student@example.com' },
      database
    );

    const [sql, values] = database.query.mock.calls[0];
    expect(sql).toContain('student_user.email ILIKE $1');
    expect(values[0]).toBe('%student@example.com%');
    expect(sql).not.toContain('password_hash');
  });
});
