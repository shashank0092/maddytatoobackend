import { QueryEmailData } from '../../email.types';
import { escapeHtml, formatCurrency, formatDate, formatText } from '../../email.utils';
import { emailConfig } from '../../email.config';

export const buildInternalQueryEmail = (data: QueryEmailData) => {
  const adminUrl = emailConfig?.ADMIN_PANEL_URL 
    ? `${emailConfig.ADMIN_PANEL_URL}/queries/${data.inquiryNumber}` 
    : null;

  const ctaHtml = adminUrl ? `
    <div style="margin-top: 30px; text-align: center;">
      <a href="${escapeHtml(adminUrl)}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">View Inquiry</a>
    </div>
  ` : '';

  const mediaList = data.media && data.media.length > 0 
    ? `<ul style="margin: 0; padding-left: 20px;">
        ${data.media.map(m => `<li>${escapeHtml(m.type)} (Key: ${escapeHtml(m.s3_key)})</li>`).join('')}
       </ul>`
    : 'None';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h1 { color: #111111; font-size: 24px; margin-top: 0; margin-bottom: 24px; border-bottom: 2px solid #eeeeee; padding-bottom: 16px; }
        h2 { color: #555555; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; margin-top: 32px; margin-bottom: 16px; border-bottom: 1px solid #eeeeee; padding-bottom: 8px; }
        .row { margin-bottom: 12px; }
        .label { font-weight: bold; color: #666666; width: 140px; display: inline-block; vertical-align: top; }
        .value { display: inline-block; width: calc(100% - 145px); margin: 0; }
        .text-box { background-color: #f5f5f5; padding: 16px; border-radius: 4px; margin-top: 8px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999999; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>New Tattoo Inquiry — ${escapeHtml(data.inquiryNumber)}</h1>
        <p>A new tattoo inquiry has been received.</p>
        
        <h2>Customer Details</h2>
        <div class="row"><span class="label">Name:</span> <span class="value">${escapeHtml(data.name)}</span></div>
        <div class="row"><span class="label">Email:</span> <span class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></span></div>
        <div class="row"><span class="label">Phone:</span> <span class="value">${escapeHtml(data.phone)}</span></div>
        
        <h2>Tattoo Details</h2>
        <div class="row"><span class="label">Idea:</span> <span class="value">${formatText(data.tattooIdea)}</span></div>
        <div class="row"><span class="label">Category:</span> <span class="value">${escapeHtml(data.category || 'Not provided')}</span></div>
        <div class="row"><span class="label">Style:</span> <span class="value">${escapeHtml(data.style || 'Not provided')}</span></div>
        <div class="row"><span class="label">Placement:</span> <span class="value">${escapeHtml(data.bodyPlacement || 'Not provided')}</span></div>
        <div class="row"><span class="label">Budget:</span> <span class="value">${formatCurrency(data.budgetMin, data.currency)} – ${formatCurrency(data.budgetMax, data.currency)}</span></div>
        
        <h2>Availability</h2>
        <div class="row"><span class="label">Date:</span> <span class="value">${formatDate(data.preferredDate)}</span></div>
        <div class="row"><span class="label">Time:</span> <span class="value">${escapeHtml(data.preferredTime || 'Not provided')}</span></div>
        
        <h2>System Information</h2>
        <div class="row"><span class="label">Status:</span> <span class="value">${escapeHtml(data.status)}</span></div>
        <div class="row"><span class="label">Priority:</span> <span class="value">${escapeHtml(data.priority)}</span></div>
        <div class="row"><span class="label">Source:</span> <span class="value">${escapeHtml(data.source)}</span></div>
        <div class="row"><span class="label">Submitted:</span> <span class="value">${formatDate(data.createdAt)}</span></div>
        
        <h2>Additional Notes</h2>
        <div class="text-box">
          ${formatText(data.additionalNotes)}
        </div>
        
        <h2>Reference Media</h2>
        <div class="value">
          ${mediaList}
        </div>
        
        ${ctaHtml}
        
        <div class="footer">
          This is an automated notification from Maddy's Tattoo & Art backend system.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Tattoo Inquiry — ${data.inquiryNumber}

Customer Details:
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}

Tattoo Details:
Idea: ${data.tattooIdea}
Category: ${data.category || 'Not provided'}
Style: ${data.style || 'Not provided'}
Placement: ${data.bodyPlacement || 'Not provided'}
Budget: ${data.budgetMin} - ${data.budgetMax} ${data.currency}

Availability:
Date: ${data.preferredDate ? data.preferredDate.toISOString() : 'Not provided'}
Time: ${data.preferredTime || 'Not provided'}

Additional Notes:
${data.additionalNotes || 'Not provided'}

System Information:
Status: ${data.status}
Priority: ${data.priority}
Source: ${data.source}
Submitted: ${data.createdAt.toISOString()}

Reference Media:
${data.media && data.media.length > 0 ? data.media.map(m => `- ${m.type} (Key: ${m.s3_key})`).join('\n') : 'None'}

${adminUrl ? `View Inquiry: ${adminUrl}` : ''}
  `.trim();

  return {
    subject: `New Tattoo Inquiry — ${data.inquiryNumber}`,
    html,
    text
  };
};
