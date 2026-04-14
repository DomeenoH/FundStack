import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import dotenv from 'dotenv';

import type { Donation } from '../lib/donor-utils';

for (const file of ['.env', '.env.local']) {
  if (fs.existsSync(file)) {
    Object.assign(process.env, dotenv.parse(fs.readFileSync(file)));
  }
}

const NOW = new Date('2026-04-14T12:00:00.000Z');

const FIXTURE_DONATIONS: Donation[] = [
  {
    id: 1,
    user_name: 'Alice',
    user_email: 'alice@example.com',
    amount: 10,
    payment_method: 'wechat',
    status: 'confirmed',
    created_at: '2026-04-13T10:00:00.000Z',
  },
  {
    id: 2,
    user_name: 'Bob',
    user_email: 'bob@example.com',
    amount: 20,
    payment_method: 'alipay',
    status: 'pending',
    created_at: '2026-04-12T10:00:00.000Z',
  },
  {
    id: 3,
    user_name: 'Carol',
    user_email: 'carol@example.com',
    amount: 30,
    payment_method: 'wechat',
    status: 'confirmed',
    created_at: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 4,
    user_name: 'Alice',
    user_email: 'alice@example.com',
    amount: 15,
    payment_method: 'qq',
    status: 'confirmed',
    created_at: '2026-04-10T10:00:00.000Z',
  },
  {
    id: 5,
    user_name: 'Dave',
    user_email: 'dave@example.com',
    amount: 50,
    payment_method: 'other',
    status: 'rejected',
    created_at: '2026-04-11T10:00:00.000Z',
  },
];

test('analytics range applies to summary, breakdowns, and ranking together', async () => {
  const routeModule = (await import('../app/api/analytics/route')) as Record<string, any>;
  const buildAnalyticsFromDonations =
    routeModule.buildAnalyticsFromDonations ??
    routeModule.default?.buildAnalyticsFromDonations ??
    routeModule['module.exports']?.buildAnalyticsFromDonations;

  assert.equal(typeof buildAnalyticsFromDonations, 'function');

  const allAnalytics = buildAnalyticsFromDonations(FIXTURE_DONATIONS, {
    range: 'all',
    now: NOW,
  });
  const lastSevenDaysAnalytics = buildAnalyticsFromDonations(FIXTURE_DONATIONS, {
    range: '7d',
    now: NOW,
  });

  assert.equal(allAnalytics.summary.total_donors, 3);
  assert.equal(allAnalytics.summary.total_amount, 75);

  assert.equal(lastSevenDaysAnalytics.range.label, '近7天');
  assert.equal(lastSevenDaysAnalytics.summary.total_donors, 2);
  assert.equal(lastSevenDaysAnalytics.summary.confirmed_donors, 1);
  assert.equal(lastSevenDaysAnalytics.summary.pending_donations, 1);
  assert.equal(lastSevenDaysAnalytics.summary.total_amount, 45);
  assert.equal(lastSevenDaysAnalytics.summary.confirmed_amount, 25);
  assert.equal(lastSevenDaysAnalytics.summary.pending_amount, 20);
  assert.equal(lastSevenDaysAnalytics.summary.average_donation, 12.5);

  assert.deepEqual(lastSevenDaysAnalytics.payment_methods, {
    wechat: { count: 1, amount: 10 },
    qq: { count: 1, amount: 15 },
  });

  assert.deepEqual(
    lastSevenDaysAnalytics.top_donors.map((donor: { name: string; amount: number }) => ({
      name: donor.name,
      amount: donor.amount,
    })),
    [{ name: 'Alice', amount: 25 }],
  );

  assert.equal(lastSevenDaysAnalytics.recent_trends.selected_range.label, '近7天');
  assert.equal(lastSevenDaysAnalytics.recent_trends.selected_range.count, 2);
  assert.equal(lastSevenDaysAnalytics.recent_trends.selected_range.total, 25);

  assert.equal(lastSevenDaysAnalytics.trends.daily.length, 7);
  assert.equal(
    lastSevenDaysAnalytics.trends.daily.reduce(
      (sum: number, point: { amount: number }) => sum + point.amount,
      0,
    ),
    25,
  );
});
