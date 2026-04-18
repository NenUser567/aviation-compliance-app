import { z } from "zod";

export const extractionSchema = z.object({
  full_name: z.string().nullable(),
  license_type: z.string().nullable(),
  license_number: z.string().nullable(),
  issue_date: z.string().nullable(),
  expiry_date: z.string().nullable(),
  medical_expiry_date: z.string().nullable(),
  nationality: z.string().nullable(),
  date_of_birth: z.string().nullable(),
  issuing_authority: z.string().nullable(),
  document_type: z.string().nullable(),
  confidence_notes: z.string().nullable(),
});

export type ExtractionSchema = z.infer<typeof extractionSchema>;