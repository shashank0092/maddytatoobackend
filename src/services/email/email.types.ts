export interface QueryEmailMedia {
  type: string;
  s3_key: string;
}

export interface QueryEmailData {
  inquiryNumber: string;
  name: string;
  email: string;
  phone: string;
  tattooIdea: string;
  
  category?: string;
  style?: string;
  bodyPlacement?: string;
  
  budgetMin?: number | null;
  budgetMax?: number | null;
  currency: string;
  
  preferredDate?: Date | null;
  preferredTime?: string | null;
  additionalNotes?: string | null;
  
  source: string;
  priority: string;
  status: string;
  createdAt: Date;
  
  media: QueryEmailMedia[];
}

export interface QueryConfirmationEmailData {
  inquiryNumber: string;
  name: string;
  tattooIdea: string;
  preferredDate?: Date | null;
  preferredTime?: string | null;
  createdAt: Date;
  businessName: string;
}
