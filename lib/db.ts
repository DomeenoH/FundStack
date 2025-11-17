import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getDonations(status?: string) {
  try {
    if (status) {
      const data = await sql`
        SELECT * FROM donations 
        WHERE status = ${status}
        ORDER BY created_at DESC
      `;
      return data;
    }
    const data = await sql`
      SELECT * FROM donations 
      ORDER BY created_at DESC
    `;
    return data;
  } catch (error) {
    console.error('[v0] Database error in getDonations:', error);
    throw error;
  }
}

export async function getConfirmedDonations() {
  try {
    const data = await sql`
      SELECT * FROM donations 
      WHERE status = 'confirmed'
      ORDER BY created_at DESC
    `;
    return data;
  } catch (error) {
    console.error('[v0] Database error in getConfirmedDonations:', error);
    return [];
  }
}

export async function createDonation(donation: {
  user_name: string;
  user_email?: string;
  user_url?: string;
  user_message?: string;
  amount: number;
  payment_method: string;
  user_ip?: string;
  user_agent?: string;
}) {
  try {
    const data = await sql`
      INSERT INTO donations 
      (user_name, user_email, user_url, user_message, amount, payment_method, user_ip, user_agent)
      VALUES 
      (${donation.user_name}, ${donation.user_email || null}, ${donation.user_url || null}, 
       ${donation.user_message || null}, ${donation.amount}, ${donation.payment_method}, 
       ${donation.user_ip}, ${donation.user_agent})
      RETURNING *
    `;
    return data[0];
  } catch (error) {
    console.error('[v0] Database error in createDonation:', error);
    throw error;
  }
}

export async function confirmDonation(id: number) {
  try {
    const data = await sql`
      UPDATE donations 
      SET status = 'confirmed', confirmed_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return data[0];
  } catch (error) {
    console.error('[v0] Database error in confirmDonation:', error);
    throw error;
  }
}

export async function rejectDonation(id: number) {
  try {
    const data = await sql`
      UPDATE donations 
      SET status = 'rejected'
      WHERE id = ${id}
      RETURNING *
    `;
    return data[0];
  } catch (error) {
    console.error('[v0] Database error in rejectDonation:', error);
    throw error;
  }
}

export async function getStats() {
  try {
    const data = await sql`
      SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END) as confirmed_total,
        SUM(amount) as total_amount,
        AVG(CASE WHEN status = 'confirmed' THEN amount END) as avg_amount
      FROM donations
    `;
    return data[0];
  } catch (error) {
    console.error('[v0] Database error in getStats:', error);
    return {
      total_count: 0,
      confirmed_count: 0,
      confirmed_total: 0,
      total_amount: 0,
      avg_amount: 0
    };
  }
}

export async function checkRateLimit(ip: string): Promise<number> {
  try {
    const data = await sql`
      SELECT COUNT(*) as count FROM donations 
      WHERE user_ip = ${ip} 
      AND created_at > NOW() - INTERVAL '24 hours'
    `;
    return data[0]?.count || 0;
  } catch (error) {
    console.error('[v0] Database error in checkRateLimit:', error);
    return 0;
  }
}
