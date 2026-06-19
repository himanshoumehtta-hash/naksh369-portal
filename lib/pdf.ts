import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function stripHtml(html: string): string {
  return html
    .replace(/<h[1-6][^>]*>/gi, '\n\n### ')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function wrapText(text: string, maxChars: number): string[] {
  if (!text.trim()) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length <= maxChars) {
      line = (line + ' ' + word).trim();
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateBlueprintPDF(
  blueprintHtml: string,
  clientName: string,
  lifePathNumber: number
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const W = 595;
  const H = 842;
  const M = 52;
  const CW = W - M * 2;

  const darkBg = rgb(0.04, 0.03, 0.07);
  const gold = rgb(0.83, 0.66, 0.13);
  const white = rgb(0.94, 0.93, 0.97);
  const gray = rgb(0.63, 0.63, 0.75);
  const dimBorder = rgb(0.15, 0.11, 0.28);

  let page = pdfDoc.addPage([W, H]);
  let y = H - M;

  const newPage = () => {
    page = pdfDoc.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: darkBg });
    y = H - M;
  };

  const needsSpace = (needed: number) => {
    if (y - needed < M + 20) newPage();
  };

  // ── Cover page ──
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: darkBg });

  // Top gold bar
  page.drawRectangle({ x: M, y: H - 6, width: CW, height: 4, color: gold });

  // Title block
  y = H - 90;
  page.drawText('NAKSH369', { x: M, y, size: 38, font: fontBold, color: gold });
  y -= 34;
  page.drawText('LIFE BLUEPRINT', { x: M, y, size: 18, font: fontBold, color: white });
  y -= 50;
  page.drawRectangle({ x: M, y: y + 10, width: CW, height: 1, color: dimBorder });
  y -= 20;
  page.drawText(`Prepared for: ${clientName}`, { x: M, y, size: 13, font: fontReg, color: white });
  y -= 22;
  page.drawText(`Life Path Number: ${lifePathNumber}`, { x: M, y, size: 12, font: fontBold, color: gold });
  y -= 18;
  page.drawText(
    `Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    { x: M, y, size: 10, font: fontReg, color: gray }
  );

  // Disclaimer at bottom of cover
  const disc = 'This reading is for spiritual guidance and entertainment purposes only. It does not constitute medical, legal, or financial advice.';
  const discLines = wrapText(disc, 80);
  let dy = 60;
  page.drawRectangle({ x: M, y: dy + discLines.length * 13 + 6, width: CW, height: 1, color: dimBorder });
  for (const dl of discLines) {
    page.drawText(dl, { x: M, y: dy, size: 9, font: fontReg, color: gray });
    dy += 13;
  }

  // ── Content pages ──
  newPage();

  const plainText = stripHtml(blueprintHtml);
  const paragraphs = plainText.split('\n\n').filter(p => p.trim());

  for (const para of paragraphs) {
    const text = para.trim();
    if (!text) continue;

    const isHeading = text.startsWith('###');
    const cleanText = isHeading ? text.replace(/^###\s*/, '') : text;

    if (isHeading) {
      needsSpace(50);
      y -= 18;
      page.drawText(cleanText.toUpperCase().slice(0, 70), {
        x: M, y, size: 11, font: fontBold, color: gold,
      });
      y -= 8;
      page.drawRectangle({ x: M, y, width: 36, height: 2, color: gold });
      y -= 12;
    } else {
      const lines = cleanText.split('\n').filter(l => l.trim());
      for (const line of lines) {
        const wrapped = wrapText(line.trim(), 88);
        for (const wl of wrapped) {
          needsSpace(16);
          page.drawText(wl, { x: M, y, size: 10, font: fontReg, color: white });
          y -= 15;
        }
        y -= 3;
      }
      y -= 8;
    }
  }

  // Footer on last content page
  page.drawRectangle({ x: M, y: 28, width: CW, height: 1, color: dimBorder });
  page.drawText('NAKSH369 — Your Cosmic Blueprint', { x: M, y: 14, size: 8, font: fontReg, color: gray });
  page.drawText('naksh369.com', { x: W - M - 70, y: 14, size: 8, font: fontReg, color: gold });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
