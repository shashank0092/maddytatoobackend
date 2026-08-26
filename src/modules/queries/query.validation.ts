import { z } from 'zod';
import { QuerySource, QueryStatus, QueryPriority } from '@prisma/client';

export const createQuerySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number is required'),
    tattoo_idea: z.string().min(10, 'Please provide more details about your tattoo idea'),
    
    budget_min: z.number().positive().optional().nullable(),
    budget_max: z.number().positive().optional().nullable(),
    currency: z.string().optional().default('INR'),
    
    preferred_date: z.string().datetime().optional().nullable(),
    preferred_time: z.string().optional().nullable(),
    additional_notes: z.string().optional().nullable(),
    
    category_id: z.string().uuid().optional().nullable(),
    style_id: z.string().uuid().optional().nullable(),
    body_placement_id: z.string().uuid().optional().nullable(),
    
    source: z.nativeEnum(QuerySource).optional().default('WEBSITE'),
    
    media: z.array(
      z.object({
        s3_key: z.string(),
        media_type: z.enum(['IMAGE', 'VIDEO']),
        mime_type: z.string().optional().nullable(),
        sort_order: z.number().int().optional().default(0)
      })
    ).optional().default([])
  })
});

export type CreateQueryInput = z.infer<typeof createQuerySchema>['body'];

export const queryQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(Number),
    limit: z.string().regex(/^\d+$/).optional().transform(Number),
    search: z.string().optional(),
    status: z.nativeEnum(QueryStatus).optional(),
    priority: z.nativeEnum(QueryPriority).optional(),
    sort: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  })
});

export type QueryQueryDTO = z.infer<typeof queryQuerySchema>['query'];

export const queryIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid query ID format'),
  }),
});

export const updateQueryStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid query ID format'),
  }),
  body: z.object({
    status: z.nativeEnum(QueryStatus),
    note: z.string().optional()
  })
});

export type UpdateQueryStatusDTO = z.infer<typeof updateQueryStatusSchema>['body'];

// Optional schema for basic query info updates by admin if needed
export const updateQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid query ID format'),
  }),
  body: z.object({
    assigned_to: z.string().uuid().optional().nullable(),
    priority: z.nativeEnum(QueryPriority).optional(),
    additional_notes: z.string().optional().nullable(),
  })
});

export type UpdateQueryDTO = z.infer<typeof updateQuerySchema>['body'];
