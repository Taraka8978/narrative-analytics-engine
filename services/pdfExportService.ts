import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  title?: string;
  company?: string;
  userName?: string;
}

export async function exportDashboardToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with ID '${elementId}' not found. Falling back to print.`);
    window.print();
    return;
  }

  try {
    // Render the DOM element to a high-res canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for sharp text and charts
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Remaining pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    const filename = `Executive_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
  } catch (err) {
    console.error('Failed to generate PDF via canvas, falling back to window.print():', err);
    window.print();
  }
}
