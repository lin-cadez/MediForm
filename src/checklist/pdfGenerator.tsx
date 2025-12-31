import { PDFDocument, rgb, PDFPage, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

interface Element {
    title: string;
    unit: string | null;
    hint: string | null;
    value: string | boolean | string[] | null;
    type?: string;
    options?: string[];
    option_type?: string;
}

interface TableRow {
    [key: string]: string | null;
}

interface TableElement {
    title: string;
    type: "table";
    columns: {
        key: string;
        title: string;
        hint?: string;
    }[];
    rows: TableRow[];
}

interface Subcategory {
    title: string;
    description: string | null;
    elements: Record<string, Element | TableElement>;
}

interface Category {
    title: string;
    description: string;
    url?: string;
    color?: string;
    subcategories: Record<string, Subcategory>;
}

interface PatientData {
    starost?: string;
    spol?: string;
    pogovorni_jezik?: string;
    razlog_obravnave?: string;
    alergija?: string;
    medicinsko_potrjena_alergija?: string;
    sum_na_alergijo?: string;
}

interface JsonData {
    title: string;
    description: string;
    predmet?: string;
    patient_data?: PatientData;
    categories: Record<string, Category>;
}

interface UserInfo {
    ime: string;
    priimek: string;
    razred: string;
    sola: string;
    podrocje?: string;
}

const fetchFont = async (url: string): Promise<Uint8Array> => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
};

const fetchImage = async (url: string): Promise<Uint8Array> => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
};

// Helper function to get current school year
const getSchoolYear = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // School year starts in September
    if (month >= 8) {
        return `${year}/${year + 1}`;
    } else {
        return `${year - 1}/${year}`;
    }
};

// Helper to format current date
const formatDate = (date: Date): string => {
    return date.toLocaleDateString("sl-SI", {
        day: "numeric",
        month: "numeric",
        year: "numeric"
    });
};

// Parse hex color to RGB
const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ];
    }
    return [1, 1, 1]; // White as default
};
// Lighten a color for better readability with black text (lighten a bit less)
const lightenColor = (color: [number, number, number], amount: number = 0.7): [number, number, number] => {
    return [
        Math.min(1, color[0] + (1 - color[0]) * amount),
        Math.min(1, color[1] + (1 - color[1]) * amount),
        Math.min(1, color[2] + (1 - color[2]) * amount)
    ];
};

export const generatePdfFromJson = async (data: JsonData, userInfo?: UserInfo): Promise<Blob> => {
    if (!data || !data.categories) {
        throw new Error("Invalid data: 'categories' key is missing.");
    }

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = await fetchFont("/fonts/Roboto-Regular.ttf");
    const fontBoldBytes = await fetchFont("/fonts/Roboto-Bold.ttf");
    const font = await pdfDoc.embedFont(fontBytes);
    const fontBold = await pdfDoc.embedFont(fontBoldBytes);

    const pageWidth = 595; // A4 width in points
    const pageHeight = 842; // A4 height in points
    const margin = 40;
    
    // Get institution name from user info or use default
    const institutionName = userInfo?.sola || "Srednja zdravstvena šola Ljubljana";

    // ==================== HELPER FUNCTIONS ====================
    
    const wrapText = (text: string, maxWidth: number, fontToUse: PDFFont, fontSize: number): string[] => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = words[0] || "";

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = fontToUse.widthOfTextAtSize(currentLine + " " + word, fontSize);
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    };

    const drawWrappedText = (
        page: PDFPage,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        fontToUse: PDFFont,
        fontSize: number,
        color: [number, number, number]
    ): number => {
        const lines = wrapText(text, maxWidth, fontToUse, fontSize);
        lines.forEach((line, i) => {
            page.drawText(line, {
                x,
                y: y - i * (fontSize + 2),
                size: fontSize,
                font: fontToUse,
                color: rgb(...color),
            });
        });
        return lines.length * (fontSize + 2);
    };

    const drawCenteredText = (
        page: PDFPage,
        text: string,
        y: number,
        fontToUse: PDFFont,
        fontSize: number,
        color: [number, number, number] = [0, 0, 0]
    ) => {
        const textWidth = fontToUse.widthOfTextAtSize(text, fontSize);
        page.drawText(text, {
            x: (pageWidth - textWidth) / 2,
            y,
            size: fontSize,
            font: fontToUse,
            color: rgb(...color),
        });
    };

    // ==================== COVER PAGE ====================
    
    let coverPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let yOffset = pageHeight - margin;

    // Institution name (top left, on every page will be added in header)
    coverPage.drawText(institutionName, {
        x: margin,
        y: yOffset,
        size: 10,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
    });
    yOffset -= 30;

    // Load and embed logos
    let logoImage = null;
    try {
        const logoBytes = await fetchImage("/logo_only.png");
        logoImage = await pdfDoc.embedPng(logoBytes);
    } catch (e) {
        console.warn("Could not load logo:", e);
    }

    // Draw logos centered
    if (logoImage) {
        const logoHeight = 60;
        const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
        const logoCenterX = pageWidth / 2 - logoWidth / 2;
        
        coverPage.drawImage(logoImage, {
            x: logoCenterX,
            y: yOffset - logoHeight,
            width: logoWidth,
            height: logoHeight,
        });
        yOffset -= logoHeight + 20;
    } else {
        // Fallback: draw MediForm text
        drawCenteredText(coverPage, "MediForm", yOffset - 30, fontBold, 24, [0.07, 0.45, 0.50]);
        yOffset -= 60;
    }

    yOffset -= 20;

    // Report title (bold, centered, uppercase)
    drawCenteredText(coverPage, data.title.toUpperCase(), yOffset, fontBold, 18, [0, 0, 0]);
    yOffset -= 30;

    // Subject (predmet) - bold, centered
    if (data.predmet) {
        drawCenteredText(coverPage, data.predmet, yOffset, fontBold, 14, [0.2, 0.2, 0.2]);
        yOffset -= 40;
    }

    // ==================== INFO TABLE ====================
    
    yOffset -= 20;
    const tableX = margin;
    const tableWidth = pageWidth - 2 * margin;
    const rowHeight = 25;

    // Helper to draw a table row
    const drawTableRow = (
        page: PDFPage,
        label: string,
        value: string,
        y: number,
        label2?: string,
        value2?: string,
        label3?: string,
        value3?: string
    ) => {
        const cellPadding = 5;
        
        // Draw border
        page.drawRectangle({
            x: tableX,
            y: y - rowHeight,
            width: tableWidth,
            height: rowHeight,
            borderColor: rgb(0, 0, 0),
            borderWidth: 0.5,
        });

        // Draw content based on number of columns
        if (label3 && value3 !== undefined) {
            // Three columns
            const colWidth = tableWidth / 3;
            page.drawText(`${label} ${value}`, {
                x: tableX + cellPadding,
                y: y - rowHeight + 8,
                size: 9,
                font: font,
                color: rgb(0, 0, 0),
            });
            page.drawLine({
                start: { x: tableX + colWidth, y: y },
                end: { x: tableX + colWidth, y: y - rowHeight },
                thickness: 0.5,
                color: rgb(0, 0, 0),
            });
            page.drawText(`${label2} ${value2}`, {
                x: tableX + colWidth + cellPadding,
                y: y - rowHeight + 8,
                size: 9,
                font: font,
                color: rgb(0, 0, 0),
            });
            page.drawLine({
                start: { x: tableX + 2 * colWidth, y: y },
                end: { x: tableX + 2 * colWidth, y: y - rowHeight },
                thickness: 0.5,
                color: rgb(0, 0, 0),
            });
            page.drawText(`${label3} ${value3}`, {
                x: tableX + 2 * colWidth + cellPadding,
                y: y - rowHeight + 8,
                size: 9,
                font: font,
                color: rgb(0, 0, 0),
            });
        } else if (label2 && value2 !== undefined) {
            // Two columns
            const colWidth = tableWidth / 2;
            page.drawText(`${label} ${value}`, {
                x: tableX + cellPadding,
                y: y - rowHeight + 8,
                size: 9,
                font: font,
                color: rgb(0, 0, 0),
            });
            page.drawLine({
                start: { x: tableX + colWidth, y: y },
                end: { x: tableX + colWidth, y: y - rowHeight },
                thickness: 0.5,
                color: rgb(0, 0, 0),
            });
            page.drawText(`${label2} ${value2}`, {
                x: tableX + colWidth + cellPadding,
                y: y - rowHeight + 8,
                size: 9,
                font: font,
                color: rgb(0, 0, 0),
            });
        } else {
            // Single column
            page.drawText(`${label} ${value}`, {
                x: tableX + cellPadding,
                y: y - rowHeight + 8,
                size: 9,
                font: font,
                color: rgb(0, 0, 0),
            });
        }

        return y - rowHeight;
    };

    // Row 1: Name, Class, School Year
    yOffset = drawTableRow(
        coverPage,
        "Ime in priimek dijaka:",
        userInfo ? `${userInfo.ime} ${userInfo.priimek}` : "",
        yOffset,
        "Razred:",
        userInfo?.razred || "",
        "Šolsko leto:",
        getSchoolYear()
    );

    // Row 2: Področje, Datum obravnave
    yOffset = drawTableRow(
        coverPage,
        "Področje izvajanja zdravstvene nege:",
        userInfo?.podrocje || "",
        yOffset,
        "Datum obravnave pacienta:",
        ""
    );

    // Row 3: Mentor, Datum oddaje
    yOffset = drawTableRow(
        coverPage,
        "Mentor/ica praktičnega pouka:",
        "",
        yOffset,
        "Datum oddaje poročila:",
        ""
    );

    yOffset -= 30;

    // ==================== DECLARATION TEXT ====================
    
    const declarationText = "S podpisom se zavezujem, da je Poročilo o zdravstveni negi pacienta moj lastni izdelek in bom z njim ravnal kot z zaupnim dokumentom.";
    const declarationHeight = drawWrappedText(
        coverPage,
        declarationText,
        margin,
        yOffset,
        tableWidth,
        font,
        10,
        [0, 0, 0]
    );
    yOffset -= declarationHeight + 20;

    // Datum and Podpis row
    coverPage.drawText(`Datum: ${formatDate(new Date())}`, {
        x: margin,
        y: yOffset,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
    });
    coverPage.drawText("Podpis kandidata:", {
        x: pageWidth / 2,
        y: yOffset,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
    });
    
    // Space for handwritten signature (no line, no name)
    yOffset -= 50;

    // ==================== PATIENT DATA SECTION ====================
    
    if (data.patient_data) {
        const pd = data.patient_data;
        
        coverPage.drawText("Podatki o pacientu:", {
            x: margin,
            y: yOffset,
            size: 12,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        yOffset -= 25;

        // Patient info row 1
        yOffset = drawTableRow(
            coverPage,
            "Starost:",
            pd.starost || "",
            yOffset,
            "Spol:",
            pd.spol || "",
            "Pogovorni jezik:",
            pd.pogovorni_jezik || "slovenščina"
        );

        // Razlog obravnave (multi-line)
        if (pd.razlog_obravnave) {
            const razlogLines = wrapText(
                `Razlog obravnave pacienta / medicinska diagnoza: ${pd.razlog_obravnave}`,
                tableWidth - 10,
                font,
                9
            );
            const razlogHeight = Math.max(razlogLines.length * 12 + 10, 40);
            
            coverPage.drawRectangle({
                x: tableX,
                y: yOffset - razlogHeight,
                width: tableWidth,
                height: razlogHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 0.5,
            });
            
            razlogLines.forEach((line, i) => {
                coverPage.drawText(line, {
                    x: tableX + 5,
                    y: yOffset - 12 - i * 12,
                    size: 9,
                    font: font,
                    color: rgb(0, 0, 0),
                });
            });
            yOffset -= razlogHeight;
        }

        // Alergija row
        yOffset = drawTableRow(
            coverPage,
            "Alergija:",
            pd.alergija || "NE",
            yOffset,
            "Medicinsko potrjena alergija na:",
            pd.medicinsko_potrjena_alergija || "/",
            "Sum na alergijo:",
            pd.sum_na_alergijo || "/"
        );
    }

    // ==================== CONTENT PAGES ====================
    
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    yOffset = pageHeight - margin;

    // Draw content header (on all content pages)
    const drawContentHeader = (currentPage: PDFPage) => {
        // Institution name - top left
        currentPage.drawText(institutionName, {
            x: margin,
            y: pageHeight - 20,
            size: 8,
            font: font,
            color: rgb(0.4, 0.4, 0.4),
        });
        
        // Date - top right
        currentPage.drawText(formatDate(new Date()), {
            x: pageWidth - margin - 60,
            y: pageHeight - 20,
            size: 9,
            font: font,
            color: rgb(0.4, 0.4, 0.4),
        });
    };

    drawContentHeader(page);
    yOffset -= 30;

    // Draw table with color support (only for headers)
    const drawTable = (
        currentPage: PDFPage,
        tableData: string[][],
        x: number,
        y: number,
        colWidths: number[],
        headerColor?: [number, number, number],
        isHeaderOnly?: boolean
    ): { newY: number; newPage: PDFPage } => {
        let currentY = y;
        let activePage = currentPage;

        tableData.forEach((row, rowIndex) => {
            let currentX = x;
            let rowHeightCalc = 20;

            // Calculate row height
            row.forEach((cell, colIndex) => {
                const lines = wrapText(cell || "—", colWidths[colIndex] - 20, font, 10);
                const cellHeight = lines.length * 12 + 10;
                rowHeightCalc = Math.max(rowHeightCalc, cellHeight);
            });

            // Check if we need a new page
            if (currentY - rowHeightCalc < margin) {
                activePage = pdfDoc.addPage([pageWidth, pageHeight]);
                currentY = pageHeight - margin;
                drawContentHeader(activePage);
                currentY -= 30;
            }

            // Draw row background ONLY for header row (rowIndex === 0) when isHeaderOnly is true
            if (rowIndex === 0 && headerColor && isHeaderOnly) {
                activePage.drawRectangle({
                    x: x,
                    y: currentY - rowHeightCalc,
                    width: colWidths.reduce((a, b) => a + b, 0),
                    height: rowHeightCalc,
                    color: rgb(...headerColor),
                });
            }

            // Draw cells
            row.forEach((cell, colIndex) => {
                const lines = wrapText(cell || "—", colWidths[colIndex] - 20, font, 10);
                lines.forEach((line, lineIndex) => {
                    activePage.drawText(line, {
                        x: currentX + 10,
                        y: currentY - 15 - lineIndex * 12,
                        size: 10,
                        font: colIndex === 0 ? font : fontBold,
                        color: rgb(0, 0, 0),
                    });
                });

                activePage.drawRectangle({
                    x: currentX,
                    y: currentY - rowHeightCalc,
                    width: colWidths[colIndex],
                    height: rowHeightCalc,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 0.5,
                });
                currentX += colWidths[colIndex];
            });

            currentY -= rowHeightCalc;
        });

        return { newY: currentY - 5, newPage: activePage };
    };

    // Process categories
    const categories = Object.keys(data.categories);
    for (const categoryKey of categories) {
        const category = data.categories[categoryKey];
        const categoryColor = category.color ? hexToRgb(category.color) : undefined;

        // Check space for category header
        if (yOffset - 60 < margin) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            yOffset = pageHeight - margin;
            drawContentHeader(page);
            yOffset -= 30;
        }

        // Category header with lightened color background
        if (categoryColor) {
            const lightenedColor = lightenColor(categoryColor, 0.3);
            page.drawRectangle({
                x: margin,
                y: yOffset - 18,
                width: pageWidth - 2 * margin,
                height: 25,
                color: rgb(...lightenedColor),
            });
        }

        // Draw text AFTER background so it's on top (always black)
        page.drawText(category.title, {
            x: margin + 5,
            y: yOffset - 13,
            size: 12,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        yOffset -= 30;

        // Category description
        if (category.description) {
            const descHeight = drawWrappedText(
                page,
                category.description,
                margin,
                yOffset,
                pageWidth - 2 * margin,
                font,
                10,
                [0.3, 0.3, 0.3]
            );
            yOffset -= descHeight + 10;
        }

        // Process subcategories
        const subcategories = Object.keys(category.subcategories);
        for (const subcategoryKey of subcategories) {
            const subcategory = category.subcategories[subcategoryKey];

            // Check if subcategory contains a table element
            const hasTableElement = Object.values(subcategory.elements).some(
                (el) => (el as any).type === "table"
            );

            if (hasTableElement) {
                // Handle table type elements
                for (const elementKey in subcategory.elements) {
                    const element = subcategory.elements[elementKey] as TableElement;
                    if (element.type === "table") {
                        // Check space for table header
                        if (yOffset - 100 < margin) {
                            page = pdfDoc.addPage([pageWidth, pageHeight]);
                            yOffset = pageHeight - margin;
                            drawContentHeader(page);
                            yOffset -= 30;
                        }

                        // Subcategory title with lightened color background
                        if (categoryColor) {
                            const lightenedColor = lightenColor(categoryColor, 0.5);
                            page.drawRectangle({
                                x: margin + 10,
                                y: yOffset - 13,
                                width: pageWidth - 2 * margin - 20,
                                height: 20,
                                color: rgb(...lightenedColor),
                            });
                        }
                        // Draw text AFTER background (always black)
                        page.drawText(subcategory.title, {
                            x: margin + 15,
                            y: yOffset - 8,
                            size: 11,
                            font: fontBold,
                            color: rgb(0, 0, 0),
                        });
                        yOffset -= 25;

                        // Draw table header
                        const numCols = element.columns.length;
                        const tableWidth = pageWidth - 2 * margin - 20;
                        const colWidth = tableWidth / numCols;

                        // Header row
                        let headerX = margin + 10;
                        const headerRowHeight = 25;
                        
                        if (categoryColor) {
                            const lightenedColor = lightenColor(categoryColor, 0.5);
                            page.drawRectangle({
                                x: margin + 10,
                                y: yOffset - headerRowHeight,
                                width: tableWidth,
                                height: headerRowHeight,
                                color: rgb(...lightenedColor),
                            });
                        }

                        element.columns.forEach((col) => {
                            const lines = wrapText(col.title, colWidth - 10, font, 8);
                            lines.forEach((line, lineIdx) => {
                                page.drawText(line, {
                                    x: headerX + 5,
                                    y: yOffset - 10 - lineIdx * 10,
                                    size: 8,
                                    font: fontBold,
                                    color: rgb(0, 0, 0),
                                });
                            });
                            page.drawRectangle({
                                x: headerX,
                                y: yOffset - headerRowHeight,
                                width: colWidth,
                                height: headerRowHeight,
                                borderColor: rgb(0, 0, 0),
                                borderWidth: 0.5,
                            });
                            headerX += colWidth;
                        });
                        yOffset -= headerRowHeight;

                        // Data rows
                        if (element.rows && element.rows.length > 0) {
                            for (const row of element.rows) {
                                let rowHeight = 20;
                                
                                // Calculate max row height
                                element.columns.forEach((col) => {
                                    const cellValue = row[col.key] || "—";
                                    const lines = wrapText(cellValue, colWidth - 10, font, 8);
                                    rowHeight = Math.max(rowHeight, lines.length * 10 + 10);
                                });

                                // Check for new page
                                if (yOffset - rowHeight < margin) {
                                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                                    yOffset = pageHeight - margin;
                                    drawContentHeader(page);
                                    yOffset -= 30;
                                }

                                let cellX = margin + 10;
                                element.columns.forEach((col) => {
                                    const cellValue = row[col.key] || "—";
                                    const lines = wrapText(cellValue, colWidth - 10, font, 8);
                                    lines.forEach((line, lineIdx) => {
                                        page.drawText(line, {
                                            x: cellX + 5,
                                            y: yOffset - 10 - lineIdx * 10,
                                            size: 8,
                                            font: font,
                                            color: rgb(0, 0, 0),
                                        });
                                    });
                                    page.drawRectangle({
                                        x: cellX,
                                        y: yOffset - rowHeight,
                                        width: colWidth,
                                        height: rowHeight,
                                        borderColor: rgb(0, 0, 0),
                                        borderWidth: 0.5,
                                    });
                                    cellX += colWidth;
                                });
                                yOffset -= rowHeight;
                            }
                        }
                        yOffset -= 15;
                    }
                }
            } else {
                // Regular elements handling
                const tableData: string[][] = [];
                for (const elementKey in subcategory.elements) {
                    const element = subcategory.elements[elementKey] as Element;
                    let valueWithUnit = "";

                    if (typeof element.value === "boolean") {
                        valueWithUnit = element.value ? "DA" : "NE";
                    } else if (Array.isArray(element.value)) {
                        valueWithUnit = element.value.join(", ");
                    } else {
                        valueWithUnit = `${element.value || "—"} ${element.unit || ""}`.trim();
                    }

                    tableData.push([element.title || "—", valueWithUnit]);
                }

                const colWidths = [200, 315];
                const estimatedTableHeight = tableData.length * 25 + 30;

                if (yOffset - estimatedTableHeight < margin) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    yOffset = pageHeight - margin;
                    drawContentHeader(page);
                    yOffset -= 30;
                }

                // Subcategory title with lightened color background
                if (categoryColor) {
                    const lightenedColor = lightenColor(categoryColor, 0.5);
                    page.drawRectangle({
                        x: margin + 10,
                        y: yOffset - 13,
                        width: pageWidth - 2 * margin - 20,
                        height: 20,
                        color: rgb(...lightenedColor),
                    });
                }
                // Draw text AFTER background (always black)
                page.drawText(subcategory.title, {
                    x: margin + 15,
                    y: yOffset - 8,
                    size: 11,
                    font: fontBold,
                    color: rgb(0, 0, 0),
                });
                yOffset -= 20;

                // Subcategory description
                if (subcategory.description) {
                    const subDescHeight = drawWrappedText(
                        page,
                        subcategory.description,
                        margin + 10,
                        yOffset,
                        pageWidth - 2 * margin - 10,
                        font,
                        9,
                        [0.4, 0.4, 0.4]
                    );
                    yOffset -= subDescHeight + 5;
                }

                // Draw table (no color on data rows)
                const tableResult = drawTable(page, tableData, margin + 10, yOffset, colWidths, undefined);
                yOffset = tableResult.newY;
                page = tableResult.newPage;
                yOffset -= 15;
            }
        }

        // Category separator
        page.drawLine({
            start: { x: margin, y: yOffset },
            end: { x: pageWidth - margin, y: yOffset },
            thickness: 1,
            color: rgb(0.8, 0.8, 0.8),
        });
        yOffset -= 20;
    }

    // ==================== FINAL PAGE - SCORING ====================
    
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    yOffset = pageHeight - margin;

    page.drawText("Število doseženih točk:", {
        x: margin,
        y: yOffset,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
    });
    
    // Line for points
    page.drawLine({
        start: { x: margin + 150, y: yOffset - 3 },
        end: { x: margin + 250, y: yOffset - 3 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
    });

    page.drawText("Podpis mentorice / mentorja:", {
        x: pageWidth / 2,
        y: yOffset,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
    });
    
    // Line for mentor signature
    page.drawLine({
        start: { x: pageWidth / 2 + 160, y: yOffset - 3 },
        end: { x: pageWidth - margin, y: yOffset - 3 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
    });

    yOffset -= 50;

    page.drawText("Opombe:", {
        x: margin,
        y: yOffset,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
    });

    // Draw lines for notes
    for (let i = 0; i < 10; i++) {
        yOffset -= 30;
        page.drawLine({
            start: { x: margin, y: yOffset },
            end: { x: pageWidth - margin, y: yOffset },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
        });
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
};
