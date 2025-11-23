import { neon } from '@neondatabase/serverless';
import { mergeDonors } from '../lib/donor-utils';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function test() {
    const sql = neon(process.env.DATABASE_URL!);
    const rawDonations = await sql`SELECT * FROM donations WHERE status != 'rejected' ORDER BY created_at DESC`;

    console.log('Raw donations:', rawDonations.length);
    console.log('Sample:', rawDonations.slice(0, 2));

    const donations = rawDonations.map((d: any) => ({
        id: d.id,
        user_name: d.user_name,
        user_email: d.user_email,
        user_url: d.user_url,
        user_message: d.user_message,
        amount: Number(d.amount || 0),
        payment_method: d.payment_method,
        status: d.status || 'pending',
        created_at: d.created_at
    }));

    const merged = mergeDonors(donations);
    console.log('\nMerged donors:', merged.length);
    console.log('IDs:', merged.map(d => ({ id: d.id, name: d.user_name })));

    await sql.end();
}

test().catch(console.error);
