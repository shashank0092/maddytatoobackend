import { QueryConfirmationEmailData } from '../../email.types';
import { escapeHtml, formatDate } from '../../email.utils';

export const buildCustomerQueryConfirmation = (data: QueryConfirmationEmailData) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h1 { color: #111111; font-size: 22px; margin-top: 0; margin-bottom: 24px; text-align: center; }
        .reference-box { background-color: #f5f5f5; border: 1px solid #eeeeee; padding: 16px; border-radius: 4px; text-align: center; margin: 32px 0; }
        .reference-label { font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .reference-number { font-size: 20px; font-weight: bold; color: #111111; margin: 0; }
        p { margin-bottom: 16px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee; padding-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>We Received Your Tattoo Inquiry</h1>
        
        <p>Hi ${escapeHtml(data.name)},</p>
        
        <p>Thank you for reaching out to ${escapeHtml(data.businessName)}. We’ve received your tattoo inquiry successfully.</p>
        
        <div class="reference-box">
          <div class="reference-label">Your inquiry reference number is</div>
          <div class="reference-number">${escapeHtml(data.inquiryNumber)}</div>
        </div>
        
        <p>Our team will review the details you shared regarding your "${escapeHtml(data.tattooIdea)}" and contact you soon to discuss your idea, availability, and next steps.</p>
        
        ${data.preferredDate ? `<p>We noted your preferred date of <strong>${formatDate(data.preferredDate)}</strong>.</p>` : ''}
        
        <p>Thank you for your interest. We look forward to working with you.</p>
        
        <p>Best regards,<br/><strong>${escapeHtml(data.businessName)}</strong></p>
        
        <div class="footer">
          Please do not reply directly to this email. A member of our team will contact you shortly.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${data.name},

Thank you for reaching out to ${data.businessName}. We’ve received your tattoo inquiry successfully.

Your inquiry reference number is:
${data.inquiryNumber}

Our team will review the details you shared regarding your "${data.tattooIdea}" and contact you soon to discuss your idea, availability, and next steps.

${data.preferredDate ? `We noted your preferred date of ${formatDate(data.preferredDate)}.` : ''}

Thank you for your interest. We look forward to working with you.

Best regards,
${data.businessName}

---
Please do not reply directly to this email. A member of our team will contact you shortly.
  `.trim();

  return {
    subject: `We Received Your Tattoo Inquiry — ${data.inquiryNumber}`,
    html,
    text
  };
};
