import mammoth from 'mammoth';

export async function parseFileToText(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileType = file.name.split('.').pop().toLowerCase();

  switch (fileType) {
    case 'pdf': {
      // Dynamic import to bypass Turbopack static ESM export strictness
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const parsedPdf = await pdfParse(buffer);
      return parsedPdf.text;
    }
    case 'docx': {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    case 'txt':
    case 'json': {
      return buffer.toString('utf-8');
    }
    default:
      throw new Error(`Unsupported file type: .${fileType}`);
  }
}