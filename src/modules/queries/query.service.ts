import { prisma } from '../../config/database';
import { CreateQueryInput } from './query.validation';
import { emailService } from '../../services/email/email.service';
import { QueryEmailData, QueryConfirmationEmailData } from '../../services/email/email.types';

export class QueryService {
  async createQuery(data: CreateQueryInput) {
    // Generate inquiry number
    const year = new Date().getFullYear();
    const count = await prisma.query.count({
      where: {
        created_at: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`)
        }
      }
    });
    
    const inquiryNumber = `INQ-${year}-${String(count + 1).padStart(6, '0')}`;

    // Perform database operations in a transaction
    const newQuery = await prisma.$transaction(async (tx) => {
      const query = await tx.query.create({
        data: {
          inquiry_number: inquiryNumber,
          name: data.name,
          email: data.email,
          phone: data.phone,
          tattoo_idea: data.tattoo_idea,
          budget_min: data.budget_min,
          budget_max: data.budget_max,
          currency: data.currency,
          preferred_date: data.preferred_date ? new Date(data.preferred_date) : null,
          preferred_time: data.preferred_time,
          additional_notes: data.additional_notes,
          category_id: data.category_id,
          style_id: data.style_id,
          body_placement_id: data.body_placement_id,
          source: data.source,
          
          media: {
            create: data.media.map(m => ({
              s3_key: m.s3_key,
              media_type: m.media_type,
              mime_type: m.mime_type,
              sort_order: m.sort_order
            }))
          },
          
          history: {
            create: {
              action: 'QUERY_CREATED',
              new_status: 'PENDING',
              note: 'Query submitted by customer via website'
            }
          }
        },
        include: {
          media: true,
          category: true,
          style: true,
          body_placement: true
        }
      });

      return query;
    });

    // Post-transaction email integration
    // We run this asynchronously and don't await it so we don't delay the API response
    // If it fails, the error is caught inside the email service, and the DB record remains intact.
    this.sendNotifications(newQuery).catch(err => {
      console.error(`Failed to send notifications for query ${inquiryNumber}:`, err);
    });

    return newQuery;
  }
  
  private async sendNotifications(query: any) {
    const internalEmailData: QueryEmailData = {
      inquiryNumber: query.inquiry_number,
      name: query.name,
      email: query.email,
      phone: query.phone,
      tattooIdea: query.tattoo_idea,
      category: query.category?.name,
      style: query.style?.name,
      bodyPlacement: query.body_placement?.name,
      budgetMin: query.budget_min ? Number(query.budget_min) : null,
      budgetMax: query.budget_max ? Number(query.budget_max) : null,
      currency: query.currency,
      preferredDate: query.preferred_date,
      preferredTime: query.preferred_time,
      additionalNotes: query.additional_notes,
      source: query.source,
      priority: query.priority,
      status: query.status,
      createdAt: query.created_at,
      media: query.media.map((m: any) => ({
        type: m.media_type,
        s3_key: m.s3_key
      }))
    };

    const customerEmailData: QueryConfirmationEmailData = {
      inquiryNumber: query.inquiry_number,
      name: query.name,
      tattooIdea: query.tattoo_idea,
      preferredDate: query.preferred_date,
      preferredTime: query.preferred_time,
      createdAt: query.created_at,
      businessName: process.env.BUSINESS_NAME || 'Maddy Tattoo Artist'
    };

    // Send emails simultaneously
    await Promise.allSettled([
      emailService.sendQueryInternalNotification(internalEmailData),
      emailService.sendQueryCustomerConfirmation(customerEmailData, query.email)
    ]);
  }
}

export const queryService = new QueryService();
