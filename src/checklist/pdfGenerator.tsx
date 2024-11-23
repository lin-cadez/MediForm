import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

interface JsonData {
  title: string;
  description: string;
  categories: Record<
    string,
    {
      title: string;
      description: string;
      subcategories: Record<
        string,
        {
          title: string;
          description: string | null;
          elements: Record<
            string,
            {
              title: string;
              unit: string | null;
              hint: string | null;
              value: string | boolean | string[] | null;
            }
          >;
        }
      >;
    }
  >;
}

const fetchFont = async (url: string): Promise<Uint8Array> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

export const generatePdfFromJson = async (data: JsonData): Promise<Blob> => {
  if (!data || !data.categories) {
    throw new Error("Invalid data: 'categories' key is missing.");
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // Fetch and embed fonts
  const fontBytes = await fetchFont("/public/fonts/Roboto-Regular.ttf");
  const fontBoldBytes = await fetchFont("/public/fonts/Roboto-Bold.ttf");
  const font = await pdfDoc.embedFont(fontBytes);
  const fontBold = await pdfDoc.embedFont(fontBoldBytes);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  let page = pdfDoc.addPage([pageWidth, pageHeight]); // A4 size in portrait mode
  let yOffset = pageHeight - margin; // Start from the top with margin

  const drawText = (
    text: string,
    x: number,
    y: number,
    options: { font: typeof font; size: number; color: [number, number, number] }
  ) => {
    page.drawText(text, {
      x,
      y,
      size: options.size,
      font: options.font,
      color: rgb(options.color[0], options.color[1], options.color[2]),
    });
  };

  const wrapText = (text: string, maxWidth: number, font: any, fontSize: number) => {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = font.widthOfTextAtSize(currentLine + ' ' + word, fontSize);
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const drawTable = (
    tableData: string[][],
    x: number,
    y: number,
    colWidths: number[]
  ) => {
    let currentY = y;
    tableData.forEach((row, rowIndex) => {
      let currentX = x;
      let rowHeight = 20;

      // Calculate the maximum height required for the row
      row.forEach((cell, colIndex) => {
        const lines = wrapText(cell || "—", colWidths[colIndex] - 20, font, 10);
        const cellHeight = lines.length * 12 + 10; // Add padding
        rowHeight = Math.max(rowHeight, cellHeight);
      });

      // Draw each cell in the row with the calculated row height
      row.forEach((cell, colIndex) => {
        const lines = wrapText(cell || "—", colWidths[colIndex] - 20, font, 10);
        lines.forEach((line, lineIndex) => {
          page.drawText(line, {
            x: currentX + 10, // Add padding
            y: currentY - 15 - (lineIndex * 12),
            size: 10,
            font: colIndex === 1 ? fontBold : font, // Make the text in the "Value" column bold
            color: rgb(0, 0, 0),
          });
        });

        page.drawRectangle({
          x: currentX,
          y: currentY - rowHeight,
          width: colWidths[colIndex],
          height: rowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });
        currentX += colWidths[colIndex];
      });
      currentY -= rowHeight + 5;

      if (currentY < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]); // A4 size in portrait mode
        currentY = pageHeight - margin;
      }
    });
    return currentY;
  };

  // Document header
  const titleWidth = fontBold.widthOfTextAtSize(data.title, 16);
  const descriptionWidth = font.widthOfTextAtSize(data.description, 12);
  drawText(data.title, (pageWidth - titleWidth) / 2, yOffset, {
    font: fontBold,
    size: 16,
    color: [0, 0, 0],
  });
  yOffset -= 20;
  drawText(data.description, (pageWidth - descriptionWidth) / 2, yOffset, {
    font,
    size: 12,
    color: [0.2, 0.2, 0.2],
  });
  yOffset -= 30;

// Add current date in the upper right corner
const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString();
drawText(`Narejeno ${formattedDate}`, pageWidth - margin - 100, pageHeight - margin / 2, {
    font: fontBold,
    size: 10,
    color: [0, 0, 0],
});

  // Process categories
  const categories = Object.keys(data.categories);
  categories.forEach((categoryKey) => {
    const category = data.categories[categoryKey];

    // Draw category title
    drawText(category.title, margin, yOffset, {
      font: fontBold,
      size: 14,
      color: [0, 0, 0],
    });
    yOffset -= 20;

    // Draw category description
    drawText(category.description, margin, yOffset, {
      font,
      size: 12,
      color: [0.2, 0.2, 0.2],
    });
    yOffset -= 20;

    const subcategories = Object.keys(category.subcategories);
    subcategories.forEach((subcategoryKey) => {
      const subcategory = category.subcategories[subcategoryKey];

      const tableData: string[][] = [];
      const elements = Object.keys(subcategory.elements);

      elements.forEach((elementKey) => {
        const element = subcategory.elements[elementKey];

        let valueWithUnit = "";
        if (typeof element.value === "boolean") {
          valueWithUnit = element.value ? "DA" : "NE";
        } else if (Array.isArray(element.value)) {
          valueWithUnit = element.value.join(", ");
        } else {
          valueWithUnit = `${element.value || "—"} ${element.unit || ""}`;
        }

        tableData.push([
          element.title || "—",
          valueWithUnit,
        ]);
      });

      const colWidths = [200, 315];

      // Check if the title, description, and table fit on the current page, if not, add a new page
      const estimatedTableHeight = tableData.length * 25; // Estimate height with padding
      const requiredHeight = 15 + (subcategory.description ? 15 : 0) + estimatedTableHeight + 30;
      if (yOffset - requiredHeight < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]); // A4 size in portrait mode
        yOffset = pageHeight - margin;
      }

      // Draw subcategory title
      drawText(subcategory.title, margin + 10, yOffset, {
        font: fontBold,
        size: 12,
        color: [0, 0, 0],
      });
      yOffset -= 15;

      // Draw subcategory description
      if (subcategory.description) {
        drawText(subcategory.description, margin + 10, yOffset, {
          font,
          size: 10,
          color: [0.2, 0.2, 0.2],
        });
        yOffset -= 15;
      }

      yOffset = drawTable(tableData, margin + 10, yOffset, colWidths);
      yOffset -= 30;
    });

    // Add separator between categories
    yOffset -= 10;
    page.drawLine({
      start: { x: margin, y: yOffset },
      end: { x: pageWidth - margin, y: yOffset },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });
    yOffset -= 20;
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
};