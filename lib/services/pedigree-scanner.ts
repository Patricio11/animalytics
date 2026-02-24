import OpenAI from 'openai';

// ============================================================================
// PEDIGREE SCANNER SERVICE
// ============================================================================
// Uses OpenAI GPT-4 Vision to extract pedigree data from certificate photos

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Position mapping for a standard 4-generation pedigree
// Generation 1: Parents (sire, dam)
// Generation 2: Grandparents (sire.sire, sire.dam, dam.sire, dam.dam)
// Generation 3: Great-grandparents
// Generation 4: Great-great-grandparents
export const PEDIGREE_POSITIONS = {
  1: ['sire', 'dam'],
  2: ['sire.sire', 'sire.dam', 'dam.sire', 'dam.dam'],
  3: [
    'sire.sire.sire', 'sire.sire.dam',
    'sire.dam.sire', 'sire.dam.dam',
    'dam.sire.sire', 'dam.sire.dam',
    'dam.dam.sire', 'dam.dam.dam',
  ],
  4: [
    'sire.sire.sire.sire', 'sire.sire.sire.dam',
    'sire.sire.dam.sire', 'sire.sire.dam.dam',
    'sire.dam.sire.sire', 'sire.dam.sire.dam',
    'sire.dam.dam.sire', 'sire.dam.dam.dam',
    'dam.sire.sire.sire', 'dam.sire.sire.dam',
    'dam.sire.dam.sire', 'dam.sire.dam.dam',
    'dam.dam.sire.sire', 'dam.dam.sire.dam',
    'dam.dam.dam.sire', 'dam.dam.dam.dam',
  ],
} as const;

export interface ExtractedPedigreeEntry {
  position: string;
  generation: number;
  name: string;
  registeredName?: string;
  registrationNumber?: string;
  breed?: string;
  sex: 'male' | 'female';
  dateOfBirth?: string;
  color?: string;
  titles?: string[];
  confidence: number; // 0-100, how confident the AI is about this entry
}

export interface PedigreeScanResult {
  success: boolean;
  entries: ExtractedPedigreeEntry[];
  animalName?: string; // The subject animal's name from the certificate
  animalRegistration?: string;
  breedDetected?: string;
  countryOfOrigin?: string;
  issuingOrganization?: string;
  warnings: string[];
  rawResponse?: string;
}

const SYSTEM_PROMPT = `You are an expert at reading and extracting data from animal pedigree certificates and registration papers from kennel clubs and breed registries worldwide. You understand pedigree documents from all countries including KUSA (South Africa), AKC (USA), KC (UK), FCI, and others.

A pedigree certificate shows a family tree with:
- The SUBJECT ANIMAL (the animal the certificate is for)
- SIRE (father) on one side
- DAM (mother) on the other side
- Going back multiple generations (typically 3-5)

The tree layout varies by country but generally:
- The subject animal is on the left or top
- Sire line is typically on the top half or left side
- Dam line is typically on the bottom half or right side
- Each generation shows both parents (sire and dam) of each ancestor

For each animal in the pedigree, extract whatever information is visible:
- Registered Name: The OFFICIAL name shown on the certificate (this is the primary identifier). On pedigree certificates, the name printed is almost always the registered/official name.
- Call Name: The everyday/short name, if visible (often not shown on certificates). If only one name is visible, put it in registeredName and leave name empty.
- Registration/stud book number
- Breed
- Color/markings
- Date of birth
- Titles/awards (Ch., GCh., etc.)

Use this position notation for the tree:
- "sire" = Father
- "dam" = Mother
- "sire.sire" = Paternal grandfather
- "sire.dam" = Paternal grandmother
- "dam.sire" = Maternal grandfather
- "dam.dam" = Maternal grandmother
- Continue pattern for deeper generations (e.g., "sire.sire.sire" = Paternal great-grandfather)

IMPORTANT RULES:
1. Only extract animals you can actually read from the document. Do not guess or fabricate.
2. Set confidence (0-100) based on how clearly you can read each entry.
3. If text is blurry or partially visible, include what you can read and lower the confidence.
4. Titles like "Ch." (Champion), "GCh." (Grand Champion), "Int.Ch." etc. should be extracted into the titles array.
5. The sex of each entry is determined by its position: positions ending in "sire" are male, positions ending in "dam" are female.
6. Registration numbers vary by country - include exactly as shown.`;

const USER_PROMPT = `Analyze this pedigree certificate document(s) (images and/or PDFs) and extract ALL animals in the family tree.

Return your response as valid JSON with this exact structure:
{
  "animalName": "Name of the subject animal (the one the certificate is for)",
  "animalRegistration": "Registration number of the subject animal",
  "breedDetected": "The breed shown on the certificate",
  "countryOfOrigin": "Country or organization that issued the certificate",
  "issuingOrganization": "The kennel club or registry (e.g., KUSA, AKC, KC)",
  "entries": [
    {
      "position": "sire",
      "generation": 1,
      "registeredName": "Official registered name as shown on certificate (REQUIRED - this is the primary name)",
      "name": "Call/everyday name if known (optional, often not on certificates)",
      "registrationNumber": "Reg number as shown",
      "breed": "Breed if shown",
      "sex": "male",
      "dateOfBirth": "YYYY-MM-DD if shown",
      "color": "Color/markings if shown",
      "titles": ["Ch.", "etc."],
      "confidence": 95
    }
  ],
  "warnings": ["Any issues or notes about the extraction"]
}

Extract every ancestor you can read from the document. Include ALL generations visible. Be thorough but accurate.`;

/**
 * Fetch a PDF from a URL and convert it to a base64 data URL
 */
async function fetchPdfAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:application/pdf;base64,${base64}`;
}

/**
 * Scan pedigree certificate images/PDFs and extract structured data
 * @param imageUrls Array of image URLs (Supabase storage URLs)
 * @param pdfUrls Array of PDF URLs (Supabase storage URLs)
 * @returns Structured pedigree data
 */
export async function scanPedigreeCertificate(
  imageUrls: string[],
  pdfUrls: string[] = []
): Promise<PedigreeScanResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      entries: [],
      warnings: ['OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.'],
    };
  }

  const totalFiles = imageUrls.length + pdfUrls.length;
  if (totalFiles === 0) {
    return {
      success: false,
      entries: [],
      warnings: ['No images or PDFs provided for scanning.'],
    };
  }

  try {
    // Build the message content with all images
    const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = imageUrls.map((url) => ({
      type: 'image_url' as const,
      image_url: {
        url,
        detail: 'high' as const, // Use high detail for better text extraction
      },
    }));

    // Convert PDFs to base64 and add as file content parts
    const pdfContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];
    for (const pdfUrl of pdfUrls) {
      const base64DataUrl = await fetchPdfAsBase64(pdfUrl);
      pdfContent.push({
        type: 'file' as any,
        file: {
          filename: 'pedigree.pdf',
          file_data: base64DataUrl,
        },
      } as any);
    }

    const allContent = [...imageContent, ...pdfContent];

    // Build descriptive text based on what was uploaded
    let contextText = USER_PROMPT;
    if (totalFiles > 1) {
      const parts: string[] = [];
      if (imageUrls.length > 0) parts.push(`${imageUrls.length} image(s)`);
      if (pdfUrls.length > 0) parts.push(`${pdfUrls.length} PDF(s)`);
      contextText = `${USER_PROMPT}\n\nI'm providing ${parts.join(' and ')} of the same pedigree certificate (different sections/pages). Combine the information from all documents into one complete pedigree.`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: contextText,
            },
            ...allContent,
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.1, // Low temperature for accurate extraction
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        entries: [],
        warnings: ['AI returned empty response. Please try again with clearer images.'],
      };
    }

    // Parse the JSON response
    const parsed = JSON.parse(content);

    // Validate and normalize entries
    // The tree displays registeredName as the primary bold text, falling back to name.
    // On certificates, the name shown IS the registered name, so we ensure registeredName is always set.
    const entries: ExtractedPedigreeEntry[] = (parsed.entries || []).map((entry: any) => {
      const registeredName = entry.registeredName || entry.name || 'Unknown';
      const callName = entry.name && entry.name !== registeredName ? entry.name : registeredName;

      return {
        position: entry.position || '',
        generation: entry.generation || 1,
        name: callName, // DB requires name NOT NULL; default to registeredName
        registeredName,
        registrationNumber: entry.registrationNumber || undefined,
        breed: entry.breed || undefined,
        sex: entry.position?.endsWith('dam') ? 'female' as const : 'male' as const,
        dateOfBirth: entry.dateOfBirth || undefined,
        color: entry.color || undefined,
        titles: Array.isArray(entry.titles) ? entry.titles : undefined,
        confidence: typeof entry.confidence === 'number' ? entry.confidence : 50,
      };
    });

    // Filter out entries with empty positions
    const validEntries = entries.filter((e) => e.position && e.name);

    return {
      success: true,
      entries: validEntries,
      animalName: parsed.animalName || undefined,
      animalRegistration: parsed.animalRegistration || undefined,
      breedDetected: parsed.breedDetected || undefined,
      countryOfOrigin: parsed.countryOfOrigin || undefined,
      issuingOrganization: parsed.issuingOrganization || undefined,
      warnings: parsed.warnings || [],
      rawResponse: content,
    };
  } catch (error: any) {
    console.error('Pedigree scan error:', error);

    if (error.code === 'insufficient_quota') {
      return {
        success: false,
        entries: [],
        warnings: ['OpenAI API quota exceeded. Please check your billing settings.'],
      };
    }

    if (error.code === 'invalid_api_key') {
      return {
        success: false,
        entries: [],
        warnings: ['Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.'],
      };
    }

    return {
      success: false,
      entries: [],
      warnings: [`AI processing failed: ${error.message || 'Unknown error'}`],
    };
  }
}
