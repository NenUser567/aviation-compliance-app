import OpenAI from "openai";
import { extractionSchema, ExtractionSchema } from "./validators";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ All possible fields
export const ALL_FIELDS = [
  "full_name",
  "license_type",
  "license_number",
  "issue_date",
  "expiry_date",
  "medical_expiry_date",
  "nationality",
  "date_of_birth",
  "issuing_authority",
  "document_type",
  "confidence_notes",
] as const;

// ✅ Prompt builder (ONLY requested fields)
function buildPrompt(fields: string[]) {
  return `
You are extracting structured data from an aviation license document.

Return ONLY valid JSON. Do not include explanations.

Use this exact JSON format:

{
${fields.map((f) => `  "${f}": string | null`).join(",\n")}
}

Rules:
- If a field is missing, return null
- Dates must be in YYYY-MM-DD format
- Do not guess values

Fields to extract:
${fields.join(", ")}
`;
}

// ✅ Ensure ALL fields exist in output
function ensureAllFields(data: any): Record<string, string | null> {
  const result: Record<string, string | null> = {};

  for (const field of ALL_FIELDS) {
    const value = data?.[field];

    if (typeof value === "string") {
      result[field] = value.trim() || null;
    } else {
      result[field] = null;
    }
  }

  return result;
}

// ✅ Safe parse
function safeJsonParse(raw: string): any | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ✅ MAIN FUNCTION
export async function extractLicenseDataFromImage(
  imageBase64: string,
  mimeType: string,
  fields?: string[] // 👈 optional now
): Promise<ExtractionSchema> {
  const selectedFields =
    fields && fields.length > 0 ? fields : [...ALL_FIELDS];

  const prompt = buildPrompt(selectedFields);

  try {
    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBase64}`,
              detail: "low",
            },
          ],
        },
      ],
      max_output_tokens: 400,
    });

    const raw = response.output_text?.trim();

    if (!raw) throw new Error("Empty LLM response");

    const parsed = safeJsonParse(raw);
    if (!parsed) throw new Error("Invalid JSON");

    const normalized = ensureAllFields(parsed);

    try {
      return extractionSchema.parse(normalized);
    } catch {
      return normalized as ExtractionSchema;
    }
  } catch (err) {
    return ensureAllFields({
      confidence_notes:
        err instanceof Error
          ? `Extraction failed: ${err.message}`
          : "Extraction failed",
    }) as ExtractionSchema;
  }
}