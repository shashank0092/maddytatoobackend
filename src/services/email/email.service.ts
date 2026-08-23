import nodemailer from 'nodemailer';
import { emailConfig, getSmtpConfig } from './email.config';
import { QueryConfirmationEmailData, QueryEmailData } from './email.types';
import { buildInternalQueryEmail } from './templates/query/internal-query-email';
import { buildCustomerQueryConfirmation } from './templates/query/customer-query-confirmation';
// Assuming logger exists in the project; using console fallback for simplicity
// A proper project would import the standard winston/pino logger
const logger = console;

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const config = getSmtpConfig();
    if (config) {
      this.transporter = nodemailer.createTransport({
        ...config,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        connectionTimeout: 10000,
      });
    }
  }

  private async sendMail(options: nodemailer.SendMailOptions): Promise<boolean> {
    if (!this.transporter || !emailConfig) {
      logger.warn(`Email not sent. Transporter not configured. Subject: ${options.subject}`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: emailConfig.SMTP_FROM,
        ...options
      });
      return true;
    } catch (error) {
      // Catching errors to prevent upstream API failure
      logger.error('Email sending failed', {
        to: options.to,
        subject: options.subject,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async sendQueryInternalNotification(data: QueryEmailData): Promise<void> {
    if (!emailConfig?.QUERY_NOTIFICATION_EMAIL) {
      logger.warn('Internal query notification skipped. QUERY_NOTIFICATION_EMAIL not set.');
      return;
    }

    const template = buildInternalQueryEmail(data);

    logger.info(`Sending internal query notification for ${data.inquiryNumber}`);
    
    await this.sendMail({
      to: emailConfig.QUERY_NOTIFICATION_EMAIL,
      replyTo: data.email, // Safe to reply-to customer for internal notification
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendQueryCustomerConfirmation(data: QueryConfirmationEmailData, customerEmail: string): Promise<void> {
    const template = buildCustomerQueryConfirmation(data);

    logger.info(`Sending customer query confirmation for ${data.inquiryNumber}`);
    
    await this.sendMail({
      to: customerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }
}

export const emailService = new EmailService();
