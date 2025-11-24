import { z } from 'zod';

export const donationSchema = z.object({
  user_name: z.string()
    .min(2, '姓名长度至少需要2个字符')
    .max(50, '姓名长度不能超过50个字符')
    .trim(),
  user_email: z.string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        // Allow QQ number (5-11 digits) or valid email
        const isQQ = /^\d{5,11}$/.test(val.trim());
        const isEmail = z.string().email().safeParse(val).success;
        return isQQ || isEmail;
      },
      { message: '请输入有效的邮箱地址或QQ号' }
    ),
  user_url: z.string()
    .url('请输入有效的URL地址')
    .optional()
    .or(z.literal('')),
  user_message: z.string()
    .max(500, '留言长度不能超过500个字符')
    .optional(),
  amount: z.number({ invalid_type_error: '请输入有效的金额' })
    .min(0.01, '金额范围为 0.01 - 99999.99')
    .max(99999.99, '金额范围为 0.01 - 99999.99'),
  payment_method: z.enum(['wechat', 'alipay', 'qq', 'other'], {
    errorMap: () => ({ message: '请选择有效的支付方式' }),
  }),
});

export type DonationFormData = z.infer<typeof donationSchema>;

export function validateDonation(data: any) {
  const result = donationSchema.safeParse(data);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.errors.map(e => e.message)
  };
}
