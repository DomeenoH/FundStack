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
    errors.push('请输入有效的姓名');
  } else if (data.user_name.length > 50) {
    errors.push('姓名长度不能超过50个字符');
  } else if (data.user_name.length < 2) {
    errors.push('姓名长度至少需要2个字符');
  }

  // Email validation (optional)
  if (data.user_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.user_email)) {
      errors.push('请输入有效的邮箱地址');
    }
  }

  // URL validation (optional)
  if (data.user_url) {
    try {
      new URL(data.user_url);
    } catch {
      errors.push('请输入有效的URL地址');
    }
  }

  // Message validation (optional)
  if (data.user_message && data.user_message.length > 500) {
    errors.push('留言长度不能超过500个字符');
  }

  // Amount validation
  if (!data.amount || typeof data.amount !== 'number') {
    errors.push('请输入有效的金额');
  } else if (data.amount < 0.01) {
    errors.push('最小捐赠金额为0.01元');
  } else if (data.amount > 99999.99) {
    errors.push('最大捐赠金额为99999.99元');
  }

  // Payment method validation
  const validMethods = ['wechat', 'alipay', 'qq', 'other'];
  if (!validMethods.includes(data.payment_method)) {
    errors.push('请选择有效的支付方式');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
