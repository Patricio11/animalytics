import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface GeneratePDFOptions {
  filename?: string;
  quality?: number;
  format?: 'a4' | 'letter' | 'legal';
  orientation?: 'portrait' | 'landscape';
}

/**
 * Generate PDF from HTML element
 * @param element - HTML element to convert to PDF
 * @param options - PDF generation options
 */
export async function generatePDFFromElement(
  element: HTMLElement,
  options: GeneratePDFOptions = {}
): Promise<void> {
  const {
    filename = `pedigree-certificate-${Date.now()}.pdf`,
    quality = 2,
    format = 'a4',
    orientation = 'landscape',
  } = options;

  try {
    // Show loading state
    const originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'wait';

    // Convert HTML to canvas with high quality
    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Get canvas dimensions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Create PDF with appropriate size
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [imgWidth / quality, imgHeight / quality],
      compress: true,
    });

    // Convert canvas to image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Add image to PDF
    pdf.addImage(
      imgData,
      'JPEG',
      0,
      0,
      imgWidth / quality,
      imgHeight / quality,
      undefined,
      'FAST'
    );

    // Save PDF
    pdf.save(filename);

    // Restore cursor
    document.body.style.cursor = originalCursor;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Generate PDF with metadata
 * @param element - HTML element to convert
 * @param metadata - PDF metadata
 */
export async function generatePDFWithMetadata(
  element: HTMLElement,
  metadata: {
    title?: string;
    subject?: string;
    author?: string;
    keywords?: string;
    creator?: string;
  },
  options: GeneratePDFOptions = {}
): Promise<void> {
  const {
    filename = `pedigree-certificate-${Date.now()}.pdf`,
    quality = 2,
    orientation = 'landscape',
  } = options;

  try {
    document.body.style.cursor = 'wait';

    const canvas = await html2canvas(element, {
      scale: quality,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [imgWidth / quality, imgHeight / quality],
      compress: true,
    });

    // Set metadata
    if (metadata.title) pdf.setProperties({ title: metadata.title });
    if (metadata.subject) pdf.setProperties({ subject: metadata.subject });
    if (metadata.author) pdf.setProperties({ author: metadata.author });
    if (metadata.keywords) pdf.setProperties({ keywords: metadata.keywords });
    if (metadata.creator) pdf.setProperties({ creator: metadata.creator || 'Animalytics' });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(
      imgData,
      'JPEG',
      0,
      0,
      imgWidth / quality,
      imgHeight / quality,
      undefined,
      'FAST'
    );

    pdf.save(filename);
    document.body.style.cursor = 'default';
  } catch (error) {
    console.error('Error generating PDF:', error);
    document.body.style.cursor = 'default';
    throw new Error('Failed to generate PDF. Please try again.');
  }
}
