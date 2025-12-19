import { neon } from '@neondatabase/serverless';
import { unstable_cache } from 'next/cache';

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
    console.error('[投喂小站] Database error in getDonations:', error);
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
    console.error('[投喂小站] Database error in getConfirmedDonations:', error);
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
    console.error('[投喂小站] Database error in createDonation:', error);
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
    console.error('[投喂小站] Database error in confirmDonation:', error);
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
    console.error('[投喂小站] Database error in rejectDonation:', error);
    throw error;
  }
}

export async function updateDonationStatus(
  id: number,
  status: 'pending' | 'confirmed' | 'rejected'
) {
  try {
    const data = await sql`
      UPDATE donations
      SET
        status = ${status},
        confirmed_at = ${status === 'confirmed' ? sql`NOW()` : null}
      WHERE id = ${id}
      RETURNING *
    `;

    return data[0];
  } catch (error) {
    console.error('[投喂小站] Database error in updateDonationStatus:', error);
    throw error;
  }
}


export const getStats = unstable_cache(
  async () => {
    try {
      const data = await sql`
        SELECT
          COUNT(*) FILTER (WHERE status != 'rejected') as total_count,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
          SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END) as confirmed_total,
          SUM(CASE WHEN status != 'rejected' THEN amount ELSE 0 END) as total_amount,
          AVG(CASE WHEN status = 'confirmed' THEN amount END) as avg_amount
        FROM donations
      `;
      return data[0];
    } catch (error) {
      console.error('[投喂小站] Database error in getStats:', error);
      return {
        total_count: 0,
        confirmed_count: 0,
        confirmed_total: 0,
        total_amount: 0,
        avg_amount: 0
      };
    }
  },
  ['donation-stats'],
  { revalidate: 60, tags: ['donation-stats'] }
);

export async function checkRateLimit(ip: string): Promise<number> {
  try {
    const data = await sql`
      SELECT COUNT(*) as count FROM donations 
      WHERE user_ip = ${ip} 
      AND created_at > NOW() - INTERVAL '24 hours'
    `;
    return data[0]?.count || 0;
  } catch (error) {
    console.error('[投喂小站] Database error in checkRateLimit:', error);
    return 0;
  }
}

// ==================== Configuration Management ====================

export async function getSiteConfig() {
  try {
    const data = await sql`
      SELECT key, value, description, updated_at 
      FROM site_config
      ORDER BY key
    `;
    // Convert array to object for easier access
    const config: Record<string, any> = {};
    data.forEach((row: any) => {
      config[row.key] = row.value;
    });
    return config;
  } catch (error) {
    console.error('[投喂小站] Database error in getSiteConfig:', error);
    return {};
  }
}

export async function getConfigByKey(key: string) {
  try {
    const data = await sql`
      SELECT value FROM site_config 
      WHERE key = ${key}
    `;
    return data[0]?.value || null;
  } catch (error) {
    console.error('[投喂小站] Database error in getConfigByKey:', error);
    return null;
  }
}

export async function updateConfig(key: string, value: any) {
  try {
    const data = await sql`
      INSERT INTO site_config (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = ${JSON.stringify(value)},
        updated_at = NOW()
      RETURNING *
    `;
    return data[0];
  } catch (error) {
    console.error('[投喂小站] Database error in updateConfig:', error);
    throw error;
  }
}

export async function batchUpdateConfig(updates: Record<string, any>) {
  try {
    const promises = Object.entries(updates).map(([key, value]) =>
      updateConfig(key, value)
    );
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('[投喂小站] Database error in batchUpdateConfig:', error);
    throw error;
  }
}

// ==================== Donation Management ====================

export async function updateDonation(
  id: number,
  data: {
    user_name?: string;
    user_email?: string;
    user_url?: string;
  }
) {
  try {
    // First fetch the existing donation to ensure we don't overwrite fields with null/undefined
    // if we were to use a static query with optional parameters.
    // This also avoids the need for dynamic SQL generation which can be tricky with tagged templates.
    const existing = await sql`
      SELECT * FROM donations WHERE id = ${id}
    `;

    if (!existing || existing.length === 0) {
      throw new Error('Donation not found');
    }

    const current = existing[0];

    // Prepare new values, using existing ones if not provided in the update data
    const user_name = data.user_name !== undefined ? data.user_name : current.user_name;
    // For email and url, we allow setting them to null/empty if passed as such, 
    // but if undefined (not in payload), we keep existing.
    // Note: The frontend sends '' for empty, which we might want to store as null or ''.
    // Let's store as null if empty string to keep DB clean, or just pass through.
    // The previous logic was: data.user_email || null.

    const user_email = data.user_email !== undefined ? (data.user_email || null) : current.user_email;
    const user_url = data.user_url !== undefined ? (data.user_url || null) : current.user_url;

    const result = await sql`
      UPDATE donations
      SET 
        user_name = ${user_name},
        user_email = ${user_email},
        user_url = ${user_url}
      WHERE id = ${id}
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error('[投喂小站] Database error in updateDonation:', error);
    throw error;
  }
}

export async function deleteDonation(id: number) {
  try {
    const result = await sql`
      DELETE FROM donations
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('[投喂小站] Database error in deleteDonation:', error);
    throw error;
  }
}

export async function batchDeleteDonations(ids: number[]) {
  try {
    if (ids.length === 0) {
      return [];
    }

    const result = await sql`
      DELETE FROM donations
      WHERE id = ANY(${ids})
      RETURNING *
    `;

    return result;
  } catch (error) {
    console.error('[投喂小站] Database error in batchDeleteDonations:', error);
    throw error;
  }
}
