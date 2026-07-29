const reportModel = require('../../src/models/report.model');

const options = {
  page: 1,
  limit: 50,
  search: '',
  status: '',
  roomId: '',
  studentId: '',
  assignedStaffId: '',
  dateFrom: '',
  dateTo: '',
};

describe('report model', () => {
  test('Admin dashboard calculates occupancy from database totals', async () => {
    const database = {
      query: jest.fn().mockResolvedValue({
        rows: [
          {
            active_students: 4,
            total_capacity: 10,
            current_occupancy: 6,
          },
        ],
      }),
    };

    await expect(
      reportModel.getDashboard({ role: 'admin' }, database)
    ).resolves.toMatchObject({
      active_students: 4,
      available_beds: 4,
      occupancy_rate: 60,
    });
  });

  test('Empty dashboard capacity returns safe zero totals', async () => {
    const database = {
      query: jest.fn().mockResolvedValue({
        rows: [{ total_capacity: 0, current_occupancy: 0 }],
      }),
    };

    await expect(
      reportModel.getDashboard({ role: 'admin' }, database)
    ).resolves.toMatchObject({
      available_beds: 0,
      occupancy_rate: 0,
    });
  });

  test('Payment report returns filtered simulated database aggregates', async () => {
    const database = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ total: 2 }] })
        .mockResolvedValueOnce({
          rows: [{ status: 'paid', total: 2, amount: '3000.00' }],
        })
        .mockResolvedValueOnce({
          rows: [{ payment_method: 'Cash', total: 2, amount: '3000.00' }],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              total_records: 2,
              total_amount: '3000.00',
              paid_amount: '3000.00',
              pending_amount: '0.00',
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ period: '2026-07-01', total: 2, amount: '3000.00' }],
        })
        .mockResolvedValueOnce({ rows: [{ id: 'payment-1' }] }),
    };

    const report = await reportModel.getPaymentReport(
      {
        ...options,
        status: 'paid',
        dateFrom: new Date('2026-07-01'),
        dateTo: new Date('2026-07-31'),
      },
      database
    );

    expect(report).toMatchObject({
      is_simulated: true,
      summary: {
        total_records: 2,
        paid_amount: '3000.00',
      },
      pagination: { total: 2, totalPages: 1 },
    });
    expect(database.query.mock.calls[0][1]).toEqual([
      'paid',
      new Date('2026-07-01'),
      new Date('2026-07-31'),
    ]);
    const allQueries = database.query.mock.calls
      .map(([statement]) => statement)
      .join('\n');
    expect(allQueries).not.toContain('password_hash');
  });

  test('Allocation report returns status, room, and period summaries', async () => {
    const database = {
      query: jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ total: 0 }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [
            {
              total_allocations: 0,
              pending_allocations: 0,
              active_allocations: 0,
              completed_allocations: 0,
              cancelled_allocations: 0,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] }),
    };

    await expect(
      reportModel.getAllocationReport(options, database)
    ).resolves.toMatchObject({
      summary: { total_allocations: 0 },
      room_breakdown: [],
      period_breakdown: [],
      records: [],
      pagination: { total: 0, totalPages: 0 },
    });
  });
});
