export interface DonationFormData {
  user_name: string;
  user_email?: string;
  user_url?: string;
  user_message?: string;
  amount: number;
  payment_method: string;
}

export function validateDonation(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Username validation
  if (!data.user_name || typeof data.user_name !== 'string') {
    errors.push('Please enter a valid name');
  } else if (data.user_name.length > 50) {
    errors.push('Name must be less than 50 characters');
  } else if (data.user_name.length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  // Email validation (optional)
  if (data.user_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.user_email)) {
      errors.push('Please enter a valid email address');
    }
  }

  // URL validation (optional)
  if (data.user_url) {
    try {
      new URL(data.user_url);
    } catch {
      errors.push('Please enter a valid URL');
    }
  }

  // Message validation (optional)
  if (data.user_message && data.user_message.length > 500) {
    errors.push('Message must be less than 500 characters');
  }

  // Amount validation
  if (!data.amount || typeof data.amount !== 'number') {
    errors.push('Please enter a valid amount');
  } else if (data.amount < 0.01) {
    errors.push('Minimum donation is 0.01');
  } else if (data.amount > 99999.99) {
    errors.push('Maximum donation is 99999.99');
  }

  // Payment method validation
  const validMethods = ['wechat', 'alipay', 'qq', 'other'];
  if (!validMethods.includes(data.payment_method)) {
    errors.push('Please select a valid payment method');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
