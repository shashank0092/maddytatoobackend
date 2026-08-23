import { z } from 'zod';

const emailConfigSchema = z.object({
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z.string().regex(/^\d+$/, "SMTP_PORT must be a number").transform(Number),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASSWORD: z.string().min(1, "SMTP_PASSWORD is required"),
  SMTP_FROM: z.string().min(1, "SMTP_FROM is required"),
  QUERY_NOTIFICATION_EMAIL: z.string().email("QUERY_NOTIFICATION_EMAIL must be a valid email"),
  ADMIN_PANEL_URL: z.string().url("ADMIN_PANEL_URL must be a valid URL").optional(),
});

const validateEmailConfig = () => {
  const parsed = emailConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    // We log but don't crash, allowing the app to run even if email is misconfigured
    // as per requirements: "Do NOT crash the entire API application"
    console.warn("⚠️ Email configuration is missing or invalid. Emails will fail to send.");
    return null;
  }
  return parsed.data;
};

export const emailConfig = validateEmailConfig();

export const getSmtpConfig = () => {
  if (!emailConfig) return null;
  
  return {
    host: emailConfig.SMTP_HOST,
    port: emailConfig.SMTP_PORT,
    // Port 465 is implicitly secure (implicit TLS). 587 uses STARTTLS (secure = false)
    secure: emailConfig.SMTP_PORT === 465,
    auth: {
      user: emailConfig.SMTP_USER,
      pass: emailConfig.SMTP_PASSWORD,
    },
  };
};
