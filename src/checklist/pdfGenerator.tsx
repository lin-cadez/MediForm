import { PDFDocument, rgb, PDFPage, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

interface Element {
    title: string;
    unit: string | null;
    hint: string | null;
    value: string | number | boolean | string[] | null;
    type?: string;
    options?: string[];
    option_type?: string;
    defaultValue?: string | boolean | string[] | number | null;
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
    datum_obravnave?: string;
    datum_oddaje?: string;
    mentor?: string;
    starost?: string;
    spol?: string;
    pogovorni_jezik?: string;
    razlog_obravnave?: string;
    alergija?: string;
    medicinsko_potrjena_alergija?: string;
    sum_na_alergijo?: string;
}

interface JsonData {
    id?: string;
    reportType?: string;
    title: string;
    description: string;
    predmet?: string;
    schoolName?: string;
    educationProgram?: string;
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

// Helper function to sort keys numerically (e.g., "1.2" before "2.1", "10" after "9")
const sortKeys = (keys: string[]): string[] => {
    return keys.sort((a, b) => {
        const partsA = a.split('.').map(Number);
        const partsB = b.split('.').map(Number);
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            const numA = partsA[i] ?? 0;
            const numB = partsB[i] ?? 0;
            if (numA !== numB) return numA - numB;
        }
        return 0;
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
    const institutionName = data.schoolName || userInfo?.sola || "Srednja zdravstvena šola Ljubljana";
    const isOrmozHealthReport = data.reportType === "healthcare_ormoz";

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

    if (data.reportType === "preschool_pud") {
        let pudPage = pdfDoc.addPage([pageWidth, pageHeight]);
        let pudY = pageHeight - margin;
        const contentWidth = pageWidth - 2 * margin;
        const pudInstitutionName = data.schoolName || institutionName || "Srednja šola test";

        const formatValue = (value: Element["value"] | undefined): string => {
            if (typeof value === "boolean") return value ? "DA" : "NE";
            if (Array.isArray(value)) return value.length ? value.join(", ") : "/";
            if (value === null || value === undefined || value === "") return "/";
            return String(value);
        };

        const formatDateValue = (value: string): string => {
            if (!value || value === "/") return "/";
            const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!match) return value;
            return `${Number(match[3])}. ${Number(match[2])}. ${match[1]}`;
        };

        const getElement = (elementId: string): Element | undefined => {
            for (const category of Object.values(data.categories)) {
                for (const subcategory of Object.values(category.subcategories || {})) {
                    const element = subcategory.elements?.[elementId] as Element | undefined;
                    if (element) return element;
                }
            }
            return undefined;
        };

        const getValue = (elementId: string): string => {
            const element = getElement(elementId);
            const value = element?.value ?? element?.defaultValue;
            if (element?.type === "date" && value === "danes") {
                return formatDate(new Date());
            }
            return element?.type === "date" ? formatDateValue(formatValue(value)) : formatValue(value);
        };

        const drawPudHeader = (currentPage: PDFPage) => {
            currentPage.drawText(pudInstitutionName, {
                x: margin,
                y: pageHeight - 22,
                size: 8,
                font,
                color: rgb(0.35, 0.35, 0.35),
            });
            currentPage.drawText(formatDate(new Date()), {
                x: pageWidth - margin - 70,
                y: pageHeight - 22,
                size: 8,
                font,
                color: rgb(0.35, 0.35, 0.35),
            });
        };

        const addPudPage = () => {
            pudPage = pdfDoc.addPage([pageWidth, pageHeight]);
            pudY = pageHeight - margin;
            drawPudHeader(pudPage);
            pudY -= 30;
        };

        const ensurePudSpace = (height: number) => {
            if (pudY - height < margin) {
                addPudPage();
            }
        };

        const drawSectionTitle = (title: string, categoryColor?: [number, number, number]) => {
            ensurePudSpace(42);
            const headerColor = categoryColor ? lightenColor(categoryColor, 0.3) : [0.88, 0.96, 0.98] as [number, number, number];
            pudPage.drawRectangle({
                x: margin,
                y: pudY - 18,
                width: contentWidth,
                height: 25,
                color: rgb(...headerColor),
            });
            pudPage.drawText(title, {
                x: margin + 5,
                y: pudY - 13,
                size: 12,
                font: fontBold,
                color: rgb(0, 0, 0),
            });
            pudY -= 30;
        };

        type PudFieldCell = {
            label: string;
            value: string;
            fullWidth: boolean;
        };

        const isLongPudField = (element: Element): boolean => {
            const title = element.title.toLowerCase();
            return Boolean(
                element.type === "longtext" ||
                element.option_type === "multiple" ||
                title.includes("evalvacija") ||
                title.includes("refleksija") ||
                title.includes("potek") ||
                title.includes("moja vloga") ||
                title.includes("zadolžitve") ||
                title.includes("cilji") ||
                title.includes("predlogi") ||
                title.includes("rutinske") ||
                title.includes("igrače") ||
                title.includes("medsebojni") ||
                title.includes("razlike") ||
                title.includes("individualni") ||
                title.includes("posebne težave") ||
                title.includes("izzivi")
            );
        };

        const buildPudRows = (fields: PudFieldCell[]): PudFieldCell[][] => {
            const rows: PudFieldCell[][] = [];
            let pendingShort: PudFieldCell | null = null;

            fields.forEach((field) => {
                if (field.fullWidth) {
                    if (pendingShort) {
                        rows.push([pendingShort]);
                        pendingShort = null;
                    }
                    rows.push([field]);
                    return;
                }

                if (pendingShort) {
                    rows.push([pendingShort, field]);
                    pendingShort = null;
                } else {
                    pendingShort = field;
                }
            });

            if (pendingShort) rows.push([pendingShort]);
            return rows;
        };

        const getPudCellHeight = (field: PudFieldCell, width: number): number => {
            const labelLines = wrapText(field.label, width - 16, fontBold, 8.5);
            const valueLines = wrapText(field.value || "/", width - 16, font, 9.5);
            const headerHeight = Math.max(22, labelLines.length * 10 + 10);
            return Math.max(52, headerHeight + valueLines.length * 12 + 14);
        };

        const drawPudCell = (
            field: PudFieldCell,
            x: number,
            y: number,
            width: number,
            height: number,
            headerColor?: [number, number, number]
        ) => {
            const padding = 8;
            const labelLines = wrapText(field.label, width - padding * 2, fontBold, 8.5);
            const headerHeight = Math.max(22, labelLines.length * 10 + 10);
            pudPage.drawRectangle({
                x,
                y: y - height,
                width,
                height,
                borderColor: rgb(0, 0, 0),
                borderWidth: 0.5,
            });
            pudPage.drawRectangle({
                x,
                y: y - headerHeight,
                width,
                height: headerHeight,
                color: rgb(...(headerColor || [0.96, 0.98, 0.99])),
            });
            pudPage.drawLine({
                start: { x, y: y - headerHeight },
                end: { x: x + width, y: y - headerHeight },
                thickness: 0.5,
                color: rgb(0, 0, 0),
            });
            labelLines.forEach((line, index) => {
                pudPage.drawText(line, {
                    x: x + padding,
                    y: y - 15 - index * 10,
                    size: 8.5,
                    font: fontBold,
                    color: rgb(0, 0, 0),
                });
            });

            const valueLines = wrapText(field.value || "/", width - padding * 2, font, 9.5);
            valueLines.forEach((line, index) => {
                const lineY = y - headerHeight - 16 - index * 12;
                if (lineY > y - height + 8) {
                    pudPage.drawText(line, {
                        x: x + padding,
                        y: lineY,
                        size: 9.5,
                        font,
                        color: rgb(0, 0, 0),
                    });
                }
            });
        };

        const drawPudTable = (fields: PudFieldCell[], headerColor?: [number, number, number]) => {
            const rows = buildPudRows(fields);

            rows.forEach((row) => {
                const isSingle = row.length === 1;
                const gap = isSingle ? 0 : 10;
                const cellWidth = isSingle ? contentWidth : (contentWidth - gap) / 2;
                const rowHeight = Math.max(
                    52,
                    ...row.map((field) => getPudCellHeight(field, cellWidth))
                );

                ensurePudSpace(rowHeight + 8);
                row.forEach((field, index) => {
                    drawPudCell(field, margin + index * (cellWidth + gap), pudY, cellWidth, rowHeight, headerColor);
                });
                pudY -= rowHeight + 8;
            });
        };

        let logoImage = null;
        try {
            const logoBytes = await fetchImage("/logo_only.png");
            logoImage = await pdfDoc.embedPng(logoBytes);
        } catch (e) {
            console.warn("Could not load logo:", e);
        }

        pudPage.drawText(pudInstitutionName, {
            x: margin,
            y: pudY,
            size: 10,
            font,
            color: rgb(0.3, 0.3, 0.3),
        });
        pudY -= 34;

        if (logoImage) {
            const logoHeight = 60;
            const logoWidth = (logoImage.width / logoImage.height) * logoHeight;
            pudPage.drawImage(logoImage, {
                x: pageWidth / 2 - logoWidth / 2,
                y: pudY - logoHeight,
                width: logoWidth,
                height: logoHeight,
            });
            pudY -= logoHeight + 40;
        } else {
            drawCenteredText(pudPage, "MediForm", pudY - 30, fontBold, 24, [0.07, 0.45, 0.50]);
            pudY -= 90;
        }

        drawCenteredText(
            pudPage,
            "POROČILO PRAKTIČNEGA USPOSABLJANJA Z DELOM",
            pudY,
            fontBold,
            18,
            [0, 0, 0]
        );
        pudY -= 30;
        drawCenteredText(pudPage, data.predmet || "Predšolska vzgoja", pudY, fontBold, 14, [0.2, 0.2, 0.2]);
        pudY -= 28;
        drawCenteredText(
            pudPage,
            data.educationProgram || "SSI-Predšolska vzgoja / Poklicni tečaj-Predšolska vzgoja",
            pudY,
            font,
            10,
            [0.25, 0.25, 0.25]
        );
        pudY -= 44;

        const coverTableX = margin;
        const coverTableWidth = contentWidth;

        const drawCoverTableRow = (
            label: string,
            value: string,
            label2?: string,
            value2?: string,
            label3?: string,
            value3?: string
        ) => {
            const cells = [
                { label, value },
                ...(label2 ? [{ label: label2, value: value2 || "/" }] : []),
                ...(label3 ? [{ label: label3, value: value3 || "/" }] : []),
            ];
            const cellWidth = coverTableWidth / cells.length;
            const cellLines = cells.map((cell) =>
                wrapText(`${cell.label} ${cell.value || "/"}`, cellWidth - 10, font, 9)
            );
            const rowHeight = Math.max(25, Math.max(...cellLines.map((lines) => lines.length)) * 12 + 10);

            pudPage.drawRectangle({
                x: coverTableX,
                y: pudY - rowHeight,
                width: coverTableWidth,
                height: rowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 0.5,
            });

            cells.forEach((_, index) => {
                const cellX = coverTableX + index * cellWidth;
                if (index > 0) {
                    pudPage.drawLine({
                        start: { x: cellX, y: pudY },
                        end: { x: cellX, y: pudY - rowHeight },
                        thickness: 0.5,
                        color: rgb(0, 0, 0),
                    });
                }
                cellLines[index].forEach((line, lineIndex) => {
                    pudPage.drawText(line, {
                        x: cellX + 5,
                        y: pudY - 15 - lineIndex * 12,
                        size: 9,
                        font,
                        color: rgb(0, 0, 0),
                    });
                });
            });

            pudY -= rowHeight;
        };

        drawCoverTableRow(
            "Ime in priimek dijaka:",
            userInfo ? `${userInfo.ime} ${userInfo.priimek}` : "/",
            "Razred:",
            userInfo?.razred || "/",
            "Šolsko leto:",
            getSchoolYear()
        );
        drawCoverTableRow("Šola:", pudInstitutionName, "Program:", data.educationProgram || data.predmet || "Predšolska vzgoja");
        drawCoverTableRow("Za dan:", getValue("1.1.1"), "Čas:", `${getValue("1.1.2")} - ${getValue("1.1.3")}`, "Del dneva:", getValue("1.1.4"));
        drawCoverTableRow("Naziv vrtca:", getValue("1.2.1"), "Enota vrtca:", getValue("1.2.2"));
        drawCoverTableRow("Skupina:", getValue("1.2.3"), "Starost otrok:", getValue("1.2.4"));
        drawCoverTableRow("Mentor/ica kandidatu/ki:", getValue("1.3.1"), "Delovno mesto mentorja/ice:", getValue("1.3.2"));
        drawCoverTableRow("Organizator/ica PUD v šoli:", getValue("1.3.3"));
        pudY -= 30;

        const declarationText = "S podpisom potrjujem, da je poročilo praktičnega usposabljanja z delom moj lastni zapis opravljenega dela, opazovanj in refleksije.";
        const declarationHeight = drawWrappedText(
            pudPage,
            declarationText,
            margin,
            pudY,
            contentWidth,
            font,
            10,
            [0, 0, 0]
        );
        pudY -= declarationHeight + 22;

        pudPage.drawText(`Datum: ${formatDate(new Date())}`, {
            x: margin,
            y: pudY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
        pudPage.drawText("Podpis kandidata/ke:", {
            x: pageWidth / 2,
            y: pudY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });

        addPudPage();
        drawCenteredText(pudPage, "DNEVNO POROČILO PUD", pudY, fontBold, 14, [0, 0, 0]);
        pudY -= 30;

        for (const categoryKey of sortKeys(Object.keys(data.categories)).filter((key) => key !== "1")) {
            const category = data.categories[categoryKey];
            const categoryColor = category.color ? hexToRgb(category.color) : undefined;
            const lightCategoryColor = categoryColor ? lightenColor(categoryColor, 0.5) : [0.96, 0.98, 0.99] as [number, number, number];
            drawSectionTitle(category.title, categoryColor);
            if (category.description) {
                const descHeight = drawWrappedText(
                    pudPage,
                    category.description,
                    margin,
                    pudY,
                    contentWidth,
                    font,
                    9,
                    [0.35, 0.35, 0.35]
                );
                pudY -= descHeight + 10;
            }

            for (const subcategoryKey of sortKeys(Object.keys(category.subcategories || {}))) {
                const subcategory = category.subcategories[subcategoryKey];
                ensurePudSpace(34);
                pudPage.drawRectangle({
                    x: margin + 10,
                    y: pudY - 13,
                    width: contentWidth - 20,
                    height: 20,
                    color: rgb(...lightCategoryColor),
                });
                pudPage.drawText(subcategory.title, {
                    x: margin + 15,
                    y: pudY - 8,
                    size: 11,
                    font: fontBold,
                    color: rgb(0, 0, 0),
                });
                pudY -= 25;

                const fields: PudFieldCell[] = [];
                for (const elementKey of sortKeys(Object.keys(subcategory.elements || {}))) {
                    const element = subcategory.elements[elementKey] as Element;
                    fields.push({
                        label: element.title,
                        value: formatValue(element.value),
                        fullWidth: isLongPudField(element),
                    });
                }
                drawPudTable(fields, lightCategoryColor);
                pudY -= 8;
            }
        }

        ensurePudSpace(100);
        pudY -= 10;
        pudPage.drawText(`Datum: ${formatDate(new Date())}`, {
            x: margin,
            y: pudY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
        pudY -= 28;
        pudPage.drawText("Posvet z mentorjem/ico:", {
            x: margin,
            y: pudY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
        pudPage.drawLine({
            start: { x: margin + 130, y: pudY - 3 },
            end: { x: pageWidth - margin, y: pudY - 3 },
            thickness: 0.5,
            color: rgb(0, 0, 0),
        });
        pudY -= 28;
        pudPage.drawText("Podpis mentorja/ice:", {
            x: pageWidth / 2,
            y: pudY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
        pudPage.drawLine({
            start: { x: pageWidth / 2 + 115, y: pudY - 3 },
            end: { x: pageWidth - margin, y: pudY - 3 },
            thickness: 0.5,
            color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    };

    if (data.reportType === "dental_technician") {
        let dentalPage = pdfDoc.addPage([pageWidth, pageHeight]);
        let dentalY = pageHeight - margin;
        const contentWidth = pageWidth - 2 * margin;
        const dentalInstitutionName = data.schoolName || institutionName || "Srednja šola test";

        const formatDentalValue = (value: Element["value"] | undefined): string => {
            if (typeof value === "boolean") return value ? "DA" : "NE";
            if (Array.isArray(value)) return value.length ? value.join(", ") : "/";
            if (value === null || value === undefined || value === "") return "/";
            return String(value);
        };

        const formatDentalDateValue = (value: string): string => {
            if (!value || value === "/") return "/";
            const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!match) return value;
            return `${Number(match[3])}. ${Number(match[2])}. ${match[1]}`;
        };

        const getDentalElement = (elementId: string): Element | undefined => {
            for (const category of Object.values(data.categories)) {
                for (const subcategory of Object.values(category.subcategories || {})) {
                    const element = subcategory.elements?.[elementId] as Element | undefined;
                    if (element) return element;
                }
            }
            return undefined;
        };

        const getDentalValue = (elementId: string): string => {
            const element = getDentalElement(elementId);
            const value = element?.value ?? element?.defaultValue;
            return element?.type === "date" ? formatDentalDateValue(formatDentalValue(value)) : formatDentalValue(value);
        };

        const drawDentalHeader = (currentPage: PDFPage) => {
            currentPage.drawText(dentalInstitutionName, {
                x: margin,
                y: pageHeight - 20,
                size: 8,
                font,
                color: rgb(0.4, 0.4, 0.4),
            });
            currentPage.drawText(formatDate(new Date()), {
                x: pageWidth - margin - 60,
                y: pageHeight - 20,
                size: 9,
                font,
                color: rgb(0.4, 0.4, 0.4),
            });
        };

        const addDentalPage = () => {
            dentalPage = pdfDoc.addPage([pageWidth, pageHeight]);
            dentalY = pageHeight - margin;
            drawDentalHeader(dentalPage);
            dentalY -= 30;
        };

        const ensureDentalSpace = (height: number) => {
            if (dentalY - height < margin) {
                addDentalPage();
            }
        };

        const drawDentalCoverRow = (
            label: string,
            value: string,
            label2?: string,
            value2?: string,
            label3?: string,
            value3?: string
        ) => {
            const cells = [
                { label, value },
                ...(label2 ? [{ label: label2, value: value2 || "/" }] : []),
                ...(label3 ? [{ label: label3, value: value3 || "/" }] : []),
            ];
            const cellWidth = contentWidth / cells.length;
            const linesByCell = cells.map((cell) =>
                wrapText(`${cell.label} ${cell.value || "/"}`, cellWidth - 10, font, 9)
            );
            const rowHeight = Math.max(25, Math.max(...linesByCell.map((lines) => lines.length)) * 12 + 10);

            dentalPage.drawRectangle({
                x: margin,
                y: dentalY - rowHeight,
                width: contentWidth,
                height: rowHeight,
                borderColor: rgb(0, 0, 0),
                borderWidth: 0.5,
            });

            cells.forEach((_, index) => {
                const cellX = margin + index * cellWidth;
                if (index > 0) {
                    dentalPage.drawLine({
                        start: { x: cellX, y: dentalY },
                        end: { x: cellX, y: dentalY - rowHeight },
                        thickness: 0.5,
                        color: rgb(0, 0, 0),
                    });
                }
                linesByCell[index].forEach((line, lineIndex) => {
                    dentalPage.drawText(line, {
                        x: cellX + 5,
                        y: dentalY - 15 - lineIndex * 12,
                        size: 9,
                        font,
                        color: rgb(0, 0, 0),
                    });
                });
            });

            dentalY -= rowHeight;
        };

        let dentalLogo = null;
        try {
            const logoBytes = await fetchImage("/logo_only.png");
            dentalLogo = await pdfDoc.embedPng(logoBytes);
        } catch (e) {
            console.warn("Could not load logo:", e);
        }

        dentalPage.drawText(dentalInstitutionName, {
            x: margin,
            y: dentalY,
            size: 10,
            font,
            color: rgb(0.3, 0.3, 0.3),
        });
        dentalY -= 34;

        if (dentalLogo) {
            const logoHeight = 58;
            const logoWidth = (dentalLogo.width / dentalLogo.height) * logoHeight;
            dentalPage.drawImage(dentalLogo, {
                x: pageWidth / 2 - logoWidth / 2,
                y: dentalY - logoHeight,
                width: logoWidth,
                height: logoHeight,
            });
            dentalY -= logoHeight + 40;
        } else {
            drawCenteredText(dentalPage, "MediForm", dentalY - 30, fontBold, 24, [0.07, 0.45, 0.50]);
            dentalY -= 90;
        }

        drawCenteredText(dentalPage, data.title.toUpperCase(), dentalY, fontBold, 18, [0, 0, 0]);
        dentalY -= 30;
        drawCenteredText(dentalPage, data.predmet || "Zobna protetika - praktični pouk", dentalY, fontBold, 14, [0.2, 0.2, 0.2]);
        dentalY -= 48;

        drawDentalCoverRow(
            "Ime in priimek dijaka:",
            userInfo ? `${userInfo.ime} ${userInfo.priimek}` : "/",
            "Razred:",
            userInfo?.razred || "/",
            "Šolsko leto:",
            getSchoolYear()
        );
        drawDentalCoverRow("Šola:", dentalInstitutionName, "Avtor predloge:", "MediForm");
        drawDentalCoverRow("Šifra delovnega naloga:", getDentalValue("1.1.1"), "Anonimizirana oznaka pacienta:", getDentalValue("1.1.2"));
        drawDentalCoverRow("Datum začetka:", getDentalValue("1.1.3"), "Datum zaključka:", getDentalValue("1.1.4"));
        drawDentalCoverRow("Zobnoprotetični izdelek:", getDentalValue("1.2.1"), "Čeljust in področje:", getDentalValue("1.2.2"));
        drawDentalCoverRow("Mentor/ica:", getDentalValue("1.1.5"), "Delovno mesto:", getDentalValue("1.1.6"));
        dentalY -= 28;

        const dentalNotice = "Poročilo ne sme vsebovati imena, priimka, datuma rojstva ali drugih prepoznavnih podatkov pacienta. Uporabi se samo šifra delovnega naloga oziroma anonimizirana oznaka.";
        const dentalNoticeHeight = drawWrappedText(
            dentalPage,
            dentalNotice,
            margin,
            dentalY,
            contentWidth,
            font,
            10,
            [0, 0, 0]
        );
        dentalY -= dentalNoticeHeight + 22;

        dentalPage.drawText(`Datum: ${formatDate(new Date())}`, {
            x: margin,
            y: dentalY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
        dentalPage.drawText("Podpis dijaka/inje:", {
            x: pageWidth / 2,
            y: dentalY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });

        addDentalPage();

        const drawDentalSectionTitle = (title: string, categoryColor?: [number, number, number]) => {
            ensureDentalSpace(42);
            const headerColor = categoryColor ? lightenColor(categoryColor, 0.25) : [0.92, 0.96, 0.98] as [number, number, number];
            dentalPage.drawRectangle({
                x: margin,
                y: dentalY - 18,
                width: contentWidth,
                height: 25,
                color: rgb(...headerColor),
            });
            dentalPage.drawText(title, {
                x: margin + 5,
                y: dentalY - 13,
                size: 12,
                font: fontBold,
                color: rgb(0, 0, 0),
            });
            dentalY -= 30;
        };

        const drawDentalSubcategoryTitle = (title: string, color: [number, number, number]) => {
            ensureDentalSpace(34);
            dentalPage.drawRectangle({
                x: margin + 10,
                y: dentalY - 13,
                width: contentWidth - 20,
                height: 20,
                color: rgb(...color),
            });
            dentalPage.drawText(title, {
                x: margin + 15,
                y: dentalY - 8,
                size: 11,
                font: fontBold,
                color: rgb(0, 0, 0),
            });
            dentalY -= 25;
        };

        const drawDentalKeyValueTable = (rows: string[][]) => {
            const labelWidth = 170;
            const valueWidth = contentWidth - 20 - labelWidth;
            rows.forEach(([label, value]) => {
                const labelLines = wrapText(label || "/", labelWidth - 12, fontBold, 9);
                const valueLines = wrapText(value || "/", valueWidth - 12, font, 9);
                const rowHeight = Math.max(26, Math.max(labelLines.length, valueLines.length) * 12 + 12);
                ensureDentalSpace(rowHeight + 2);

                const tableX = margin + 10;
                dentalPage.drawRectangle({
                    x: tableX,
                    y: dentalY - rowHeight,
                    width: contentWidth - 20,
                    height: rowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 0.5,
                });
                dentalPage.drawLine({
                    start: { x: tableX + labelWidth, y: dentalY },
                    end: { x: tableX + labelWidth, y: dentalY - rowHeight },
                    thickness: 0.5,
                    color: rgb(0, 0, 0),
                });
                labelLines.forEach((line, index) => {
                    dentalPage.drawText(line, {
                        x: tableX + 6,
                        y: dentalY - 17 - index * 12,
                        size: 9,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                    });
                });
                valueLines.forEach((line, index) => {
                    dentalPage.drawText(line, {
                        x: tableX + labelWidth + 6,
                        y: dentalY - 17 - index * 12,
                        size: 9,
                        font,
                        color: rgb(0, 0, 0),
                    });
                });
                dentalY -= rowHeight;
            });
            dentalY -= 10;
        };

        const drawDentalDataTable = (element: TableElement, headerColor: [number, number, number]) => {
            const tableX = margin + 10;
            const tableWidth = contentWidth - 20;
            const columnCount = element.columns.length;
            const colWidth = tableWidth / columnCount;
            const drawRow = (values: string[], isHeader: boolean) => {
                const rowLines = values.map((value) => wrapText(value || "/", colWidth - 10, isHeader ? fontBold : font, 8));
                const rowHeight = Math.max(24, Math.max(...rowLines.map((lines) => lines.length)) * 10 + 10);
                ensureDentalSpace(rowHeight + 2);

                if (isHeader) {
                    dentalPage.drawRectangle({
                        x: tableX,
                        y: dentalY - rowHeight,
                        width: tableWidth,
                        height: rowHeight,
                        color: rgb(...headerColor),
                    });
                }

                rowLines.forEach((lines, columnIndex) => {
                    const cellX = tableX + columnIndex * colWidth;
                    dentalPage.drawRectangle({
                        x: cellX,
                        y: dentalY - rowHeight,
                        width: colWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 0.5,
                    });
                    lines.forEach((line, lineIndex) => {
                        dentalPage.drawText(line, {
                            x: cellX + 5,
                            y: dentalY - 12 - lineIndex * 10,
                            size: 8,
                            font: isHeader ? fontBold : font,
                            color: rgb(0, 0, 0),
                        });
                    });
                });

                dentalY -= rowHeight;
            };

            drawRow(element.columns.map((column) => column.title), true);
            if (element.rows.length) {
                element.rows.forEach((row) => {
                    drawRow(element.columns.map((column) => row[column.key] || "/"), false);
                });
            } else {
                drawRow(element.columns.map(() => "/"), false);
            }
            dentalY -= 12;
        };

        for (const categoryKey of sortKeys(Object.keys(data.categories))) {
            const category = data.categories[categoryKey];
            const categoryColor = category.color ? hexToRgb(category.color) : undefined;
            const lightCategoryColor = categoryColor ? lightenColor(categoryColor, 0.5) : [0.96, 0.98, 0.99] as [number, number, number];
            drawDentalSectionTitle(category.title, categoryColor);
            if (category.description) {
                const descHeight = drawWrappedText(
                    dentalPage,
                    category.description,
                    margin,
                    dentalY,
                    contentWidth,
                    font,
                    10,
                    [0.3, 0.3, 0.3]
                );
                dentalY -= descHeight + 10;
            }

            for (const subcategoryKey of sortKeys(Object.keys(category.subcategories || {}))) {
                const subcategory = category.subcategories[subcategoryKey];
                drawDentalSubcategoryTitle(subcategory.title, lightCategoryColor);
                if (subcategory.description) {
                    const subDescHeight = drawWrappedText(
                        dentalPage,
                        subcategory.description,
                        margin + 10,
                        dentalY,
                        contentWidth - 20,
                        font,
                        9,
                        [0.35, 0.35, 0.35]
                    );
                    dentalY -= subDescHeight + 8;
                }

                const valueRows: string[][] = [];
                for (const elementKey of sortKeys(Object.keys(subcategory.elements || {}))) {
                    const element = subcategory.elements[elementKey];
                    if ((element as TableElement).type === "table") {
                        if (valueRows.length) {
                            drawDentalKeyValueTable(valueRows);
                            valueRows.length = 0;
                        }
                        const tableElement = element as TableElement;
                        dentalPage.drawText(tableElement.title, {
                            x: margin + 10,
                            y: dentalY,
                            size: 10,
                            font: fontBold,
                            color: rgb(0, 0, 0),
                        });
                        dentalY -= 16;
                        drawDentalDataTable(tableElement, lightCategoryColor);
                    } else {
                        const field = element as Element;
                        valueRows.push([field.title, formatDentalValue(field.value)]);
                    }
                }
                if (valueRows.length) {
                    drawDentalKeyValueTable(valueRows);
                }
                dentalY -= 8;
            }
        }

        ensureDentalSpace(90);
        dentalY -= 10;
        dentalPage.drawText("Opomba mentorja/ice:", {
            x: margin,
            y: dentalY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
        dentalPage.drawLine({
            start: { x: margin + 120, y: dentalY - 3 },
            end: { x: pageWidth - margin, y: dentalY - 3 },
            thickness: 0.5,
            color: rgb(0, 0, 0),
        });
        dentalY -= 28;
        dentalPage.drawText("Podpis mentorja/ice:", {
            x: pageWidth / 2,
            y: dentalY,
            size: 10,
            font,
            color: rgb(0, 0, 0),
        });
        dentalPage.drawLine({
            start: { x: pageWidth / 2 + 115, y: dentalY - 3 },
            end: { x: pageWidth - margin, y: dentalY - 3 },
            thickness: 0.5,
            color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
    };

    // ==================== COVER PAGE ====================
    
    const coverPage = pdfDoc.addPage([pageWidth, pageHeight]);
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

    if (!isOrmozHealthReport) {
        // Row 2: Področje, Datum obravnave
        yOffset = drawTableRow(
            coverPage,
            "Področje izvajanja zdravstvene nege:",
            userInfo?.podrocje || "",
            yOffset,
            "Datum obravnave pacienta:",
            data.patient_data?.datum_obravnave || ""
        );

        // Row 3: Mentor, Datum oddaje
        yOffset = drawTableRow(
            coverPage,
            "Mentor/ica praktičnega pouka:",
            data.patient_data?.mentor || "",
            yOffset,
            "Datum oddaje poročila:",
            data.patient_data?.datum_oddaje || ""
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
    }

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

    // ==================== HEALTH REPORT CONTENT PAGES ====================

    // Health content is intentionally landscape: long care descriptions and
    // medication tables stay readable without reducing the type excessively.
    const healthPageWidth = pageHeight;
    const healthPageHeight = pageWidth;
    const healthMargin = 24;
    const healthContentWidth = healthPageWidth - healthMargin * 2;
    const healthBottom = 24;
    const healthDefaultBanner: [number, number, number] = [0.87, 0.94, 0.97];
    const healthSubheader: [number, number, number] = [0.95, 0.97, 0.98];

    let page = pdfDoc.addPage([healthPageWidth, healthPageHeight]);
    yOffset = healthPageHeight - 44;

    const drawHealthPageHeader = (currentPage: PDFPage) => {
        currentPage.drawText(institutionName, {
            x: healthMargin,
            y: healthPageHeight - 18,
            size: 7.5,
            font,
            color: rgb(0.35, 0.35, 0.35),
        });

        const headerDate = formatDate(new Date());
        const headerDateWidth = font.widthOfTextAtSize(headerDate, 7.5);
        currentPage.drawText(headerDate, {
            x: healthPageWidth - healthMargin - headerDateWidth,
            y: healthPageHeight - 18,
            size: 7.5,
            font,
            color: rgb(0.35, 0.35, 0.35),
        });

        currentPage.drawLine({
            start: { x: healthMargin, y: healthPageHeight - 25 },
            end: { x: healthPageWidth - healthMargin, y: healthPageHeight - 25 },
            thickness: 0.5,
            color: rgb(0.72, 0.76, 0.79),
        });
    };

    const addHealthPage = () => {
        page = pdfDoc.addPage([healthPageWidth, healthPageHeight]);
        drawHealthPageHeader(page);
        yOffset = healthPageHeight - 44;
    };

    drawHealthPageHeader(page);

    const formatHealthDate = (value: string): string => {
        if (!value || value === "/") return "/";
        if (value === "danes") return formatDate(new Date());
        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return value;
        return `${Number(match[3])}. ${Number(match[2])}. ${match[1]}`;
    };

    const formatHealthValue = (element: Element): string => {
        const rawValue = element.value ?? element.defaultValue;
        let value = "/";

        if (typeof rawValue === "boolean") {
            value = rawValue ? "DA" : "NE";
        } else if (Array.isArray(rawValue)) {
            value = rawValue.length ? rawValue.join(", ") : "/";
        } else if (rawValue !== null && rawValue !== undefined && rawValue !== "") {
            value = String(rawValue);
        }

        if (element.type === "date") value = formatHealthDate(value);
        return element.unit && value !== "/" ? `${value} ${element.unit}` : value;
    };

    type HealthCellStyle = {
        font: PDFFont;
        size: number;
        fill?: [number, number, number];
        color?: [number, number, number];
    };

    const wrapHealthText = (
        text: string,
        maxWidth: number,
        fontToUse: PDFFont,
        fontSize: number
    ): string[] => {
        const wrappedLines: string[] = [];
        const paragraphs = String(text || "/").replace(/\r/g, "").split("\n");

        const breakLongWord = (word: string): string[] => {
            const parts: string[] = [];
            let part = "";

            for (const character of word) {
                if (part && fontToUse.widthOfTextAtSize(part + character, fontSize) > maxWidth) {
                    parts.push(part);
                    part = character;
                } else {
                    part += character;
                }
            }
            if (part) parts.push(part);
            return parts;
        };

        paragraphs.forEach((paragraph) => {
            const words = paragraph.trim().split(/\s+/).filter(Boolean);
            if (!words.length) {
                wrappedLines.push("");
                return;
            }

            let currentLine = "";
            words.forEach((word) => {
                const candidate = currentLine ? `${currentLine} ${word}` : word;
                if (fontToUse.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
                    currentLine = candidate;
                    return;
                }

                if (currentLine) {
                    wrappedLines.push(currentLine);
                    currentLine = "";
                }

                const wordParts = breakLongWord(word);
                if (wordParts.length > 1) {
                    wrappedLines.push(...wordParts.slice(0, -1));
                    currentLine = wordParts[wordParts.length - 1];
                } else {
                    currentLine = wordParts[0] || "";
                }
            });

            if (currentLine) wrappedLines.push(currentLine);
        });

        return wrappedLines.length ? wrappedLines : ["/"];
    };

    const measureHealthRow = (
        cells: string[],
        widths: number[],
        styles: HealthCellStyle[],
        minHeight = 24
    ): number => {
        return Math.max(
            minHeight,
            ...cells.map((cell, index) => {
                const style = styles[index];
                const lines = wrapHealthText(cell || "/", widths[index] - 12, style.font, style.size);
                return lines.length * (style.size + 2.4) + 10;
            })
        );
    };

    const drawHealthLineRow = (
        lineCells: string[][],
        widths: number[],
        styles: HealthCellStyle[],
        rowHeight: number
    ) => {
        let cellX = healthMargin;

        lineCells.forEach((lines, index) => {
            const style = styles[index];
            if (style.fill) {
                page.drawRectangle({
                    x: cellX,
                    y: yOffset - rowHeight,
                    width: widths[index],
                    height: rowHeight,
                    color: rgb(...style.fill),
                });
            }

            page.drawRectangle({
                x: cellX,
                y: yOffset - rowHeight,
                width: widths[index],
                height: rowHeight,
                borderColor: rgb(0.15, 0.15, 0.15),
                borderWidth: 0.55,
            });

            lines.forEach((line, lineIndex) => {
                page.drawText(line, {
                    x: cellX + 6,
                    y: yOffset - 7 - style.size - lineIndex * (style.size + 2.4),
                    size: style.size,
                    font: style.font,
                    color: rgb(...(style.color || [0, 0, 0])),
                });
            });

            cellX += widths[index];
        });

        yOffset -= rowHeight;
    };

    const drawHealthRow = (
        cells: string[],
        widths: number[],
        styles: HealthCellStyle[],
        minHeight = 24,
        forcedHeight?: number
    ) => {
        const rowHeight = forcedHeight || measureHealthRow(cells, widths, styles, minHeight);
        const lineCells = cells.map((cell, index) =>
            wrapHealthText(cell || "/", widths[index] - 12, styles[index].font, styles[index].size)
        );
        drawHealthLineRow(lineCells, widths, styles, rowHeight);
    };

    const drawPaginatedHealthRow = (
        cells: string[],
        widths: number[],
        styles: HealthCellStyle[],
        minHeight: number,
        onPageBreak: () => void
    ) => {
        const allLines = cells.map((cell, index) =>
            wrapHealthText(cell || "/", widths[index] - 12, styles[index].font, styles[index].size)
        );
        const offsets = allLines.map(() => 0);

        while (allLines.some((lines, index) => offsets[index] < lines.length)) {
            const availableHeight = yOffset - healthBottom;
            const maxLineHeight = Math.max(...styles.map((style) => style.size + 2.4));
            const availableLineCount = Math.floor((availableHeight - 10) / maxLineHeight);

            if (availableHeight < minHeight || availableLineCount < 1) {
                onPageBreak();
                continue;
            }

            const remainingLineCount = Math.max(
                ...allLines.map((lines, index) => lines.length - offsets[index])
            );
            const chunkLineCount = Math.min(availableLineCount, remainingLineCount);
            const lineCells = allLines.map((lines, index) => {
                const chunk = lines.slice(offsets[index], offsets[index] + chunkLineCount);
                offsets[index] += chunk.length;
                return chunk;
            });
            const rowHeight = Math.max(
                minHeight,
                ...lineCells.map((lines, index) =>
                    lines.length * (styles[index].size + 2.4) + 10
                )
            );

            drawHealthLineRow(lineCells, widths, styles, rowHeight);

            if (allLines.some((lines, index) => offsets[index] < lines.length)) {
                onPageBreak();
            }
        }
    };

    const getCategoryBannerColor = (category: Category): [number, number, number] => {
        if (!category.color) return healthDefaultBanner;
        const color = hexToRgb(category.color);
        const luminance = color[0] * 0.299 + color[1] * 0.587 + color[2] * 0.114;
        return lightenColor(color, luminance < 0.68 ? 0.5 : 0.12);
    };

    const drawHealthBanner = (
        title: string,
        bannerColor: [number, number, number],
        compact = false
    ) => {
        const size = compact ? 9.5 : 11;
        const lines = wrapHealthText(title, healthContentWidth - 14, fontBold, size);
        const bannerHeight = Math.max(compact ? 22 : 25, lines.length * (size + 2) + 9);

        if (yOffset - bannerHeight < healthBottom) addHealthPage();

        page.drawRectangle({
            x: healthMargin,
            y: yOffset - bannerHeight,
            width: healthContentWidth,
            height: bannerHeight,
            color: rgb(...bannerColor),
            borderColor: rgb(0.15, 0.15, 0.15),
            borderWidth: 0.55,
        });

        lines.forEach((line, index) => {
            page.drawText(line, {
                x: healthMargin + 7,
                y: yOffset - 7 - size - index * (size + 2),
                size,
                font: fontBold,
                color: rgb(0, 0, 0),
            });
        });

        yOffset -= bannerHeight;
    };

    const drawContinuationBanner = (
        title: string,
        bannerColor: [number, number, number]
    ) => {
        addHealthPage();
        drawHealthBanner(`${title} (nadaljevanje)`, bannerColor, true);
    };

    const getWeightedColumnWidths = (columnCount: number): number[] => {
        const weightsByCount: Record<number, number[]> = {
            2: [0.9, 1.6],
            3: [1.05, 1.65, 0.75],
            4: [1.05, 0.75, 1.35, 1.2],
            7: [1.2, 0.9, 1.45, 0.85, 1, 1.1, 1.45],
        };
        const weights = weightsByCount[columnCount] || Array(columnCount).fill(1);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        return weights.map((weight) => healthContentWidth * (weight / totalWeight));
    };

    const isHealthActivityCategory = (category: Category): boolean =>
        category.title.toLowerCase().startsWith("aktivnosti zdravstvene nege");

    const getHealthCategoryTitle = (
        category: Category,
        hasTableElements: boolean,
        isActivity: boolean
    ): string => {
        if (isActivity && category.title.trim().toLowerCase() === "aktivnosti zdravstvene nege" && category.description) {
            return `${category.title} pri življenjski aktivnosti ${category.description.toLowerCase()}`;
        }
        if (!isActivity && !hasTableElements && category.description) {
            return `${category.title} - ${category.description}`;
        }
        return category.title;
    };

    const categories = sortKeys(Object.keys(data.categories));
    for (const categoryKey of categories) {
        const category = data.categories[categoryKey];
        const bannerColor = getCategoryBannerColor(category);
        const isActivity = isHealthActivityCategory(category);
        const subcategories = sortKeys(Object.keys(category.subcategories));
        const hasTableElements = subcategories.some((subcategoryKey) =>
            Object.values(category.subcategories[subcategoryKey].elements || {}).some(
                (element) => (element as TableElement).type === "table"
            )
        );
        const categoryTitle = getHealthCategoryTitle(category, hasTableElements, isActivity);

        if (yOffset - 100 < healthBottom) addHealthPage();
        drawHealthBanner(categoryTitle, bannerColor);

        for (const subcategoryKey of subcategories) {
            const subcategory = category.subcategories[subcategoryKey];
            const elementKeys = sortKeys(Object.keys(subcategory.elements || {}));
            if (!elementKeys.length) continue;

            const tableElements = elementKeys
                .map((elementKey) => subcategory.elements[elementKey] as Element | TableElement)
                .filter((element): element is TableElement => element.type === "table");

            if (tableElements.length) {
                for (const tableElement of tableElements) {
                    const columnWidths = getWeightedColumnWidths(tableElement.columns.length);
                    const headerCells = tableElement.columns.map((column) => column.title);
                    const headerStyles = headerCells.map(() => ({
                        font: fontBold,
                        size: tableElement.columns.length >= 6 ? 7.2 : 8,
                        fill: healthSubheader,
                    }));
                    const tableContextTitle = tableElement.title || subcategory.title || categoryTitle;
                    const contextTitleLines = wrapHealthText(
                        tableContextTitle,
                        healthContentWidth - 14,
                        fontBold,
                        9.5
                    );
                    const contextTitleHeight = Math.max(22, contextTitleLines.length * 11.5 + 9);
                    const headerHeight = measureHealthRow(headerCells, columnWidths, headerStyles, 28);

                    const drawTableContext = () => {
                        drawHealthBanner(tableContextTitle, lightenColor(bannerColor, 0.35), true);
                        drawHealthRow(headerCells, columnWidths, headerStyles, 28, headerHeight);
                    };

                    if (yOffset - contextTitleHeight - headerHeight - 26 < healthBottom) {
                        drawContinuationBanner(categoryTitle, bannerColor);
                    }
                    drawTableContext();

                    const rows = tableElement.rows?.length ? tableElement.rows : [];
                    for (const row of rows) {
                        const cells = tableElement.columns.map((column) => row[column.key] || "/");
                        const dataStyles = cells.map(() => ({
                            font: fontBold,
                            size: tableElement.columns.length >= 6 ? 7.3 : 8.2,
                        }));
                        const rowHeight = measureHealthRow(cells, columnWidths, dataStyles, 26);

                        if (yOffset - rowHeight < healthBottom) {
                            drawContinuationBanner(categoryTitle, bannerColor);
                            drawTableContext();
                        }
                        drawPaginatedHealthRow(cells, columnWidths, dataStyles, 26, () => {
                            drawContinuationBanner(categoryTitle, bannerColor);
                            drawTableContext();
                        });
                    }
                }

                yOffset -= 12;
                continue;
            }

            const elements = elementKeys.map(
                (elementKey) => subcategory.elements[elementKey] as Element
            );

            if (isActivity) {
                const dateElement = elements.find(
                    (element) => element.type === "date" || element.title.toLowerCase().includes("datum izvedbe")
                );
                const activityElements = elements.filter((element) => element !== dateElement);
                const dateText = dateElement ? `Datum izvedbe: ${formatHealthValue(dateElement)}` : "";
                const hasDate = Boolean(dateElement);
                const headerWidths = hasDate
                    ? [healthContentWidth * 0.35, healthContentWidth * 0.45, healthContentWidth * 0.2]
                    : [healthContentWidth * 0.38, healthContentWidth * 0.62];
                const headerCells = hasDate
                    ? [
                        subcategory.title || "Aktivnosti zdravstvene nege",
                        "Podatki o izvedeni aktivnosti zdravstvene nege",
                        dateText,
                    ]
                    : [
                        subcategory.title || "Aktivnosti zdravstvene nege",
                        "Podatki o izvedeni aktivnosti zdravstvene nege",
                    ];
                const headerStyles = headerCells.map(() => ({
                    font,
                    size: 8.7,
                    fill: healthSubheader,
                }));
                const headerHeight = measureHealthRow(headerCells, headerWidths, headerStyles, 25);

                if (yOffset - headerHeight < healthBottom) {
                    drawContinuationBanner(categoryTitle, bannerColor);
                }
                drawHealthRow(headerCells, headerWidths, headerStyles, 25, headerHeight);

                const activityWidths = [healthContentWidth * 0.35, healthContentWidth * 0.65];
                for (const element of activityElements) {
                    const cells = [element.title || "/", formatHealthValue(element)];
                    const styles = [
                        { font: fontBold, size: 8.8 },
                        { font: fontBold, size: 8.8 },
                    ];
                    const rowHeight = measureHealthRow(cells, activityWidths, styles, 26);
                    if (yOffset - rowHeight < healthBottom) {
                        drawContinuationBanner(categoryTitle, bannerColor);
                        drawHealthRow(headerCells, headerWidths, headerStyles, 25, headerHeight);
                    }
                    drawPaginatedHealthRow(cells, activityWidths, styles, 26, () => {
                        drawContinuationBanner(categoryTitle, bannerColor);
                        drawHealthRow(headerCells, headerWidths, headerStyles, 25, headerHeight);
                    });
                }

                yOffset -= 12;
                continue;
            }

            if (yOffset - 45 < healthBottom) {
                drawContinuationBanner(categoryTitle, bannerColor);
            }
            drawHealthBanner(subcategory.title, lightenColor(bannerColor, 0.42), true);

            if (subcategory.description) {
                const descriptionStyles = [{ font, size: 8.5, fill: healthSubheader }];
                const descriptionCells = [subcategory.description];
                const descriptionWidths = [healthContentWidth];
                const descriptionHeight = measureHealthRow(
                    descriptionCells,
                    descriptionWidths,
                    descriptionStyles,
                    24
                );
                if (yOffset - descriptionHeight < healthBottom) {
                    drawContinuationBanner(categoryTitle, bannerColor);
                    drawHealthBanner(subcategory.title, lightenColor(bannerColor, 0.42), true);
                }
                drawHealthRow(
                    descriptionCells,
                    descriptionWidths,
                    descriptionStyles,
                    24,
                    descriptionHeight
                );
            }

            const regularWidths = [healthContentWidth * 0.34, healthContentWidth * 0.66];
            for (const element of elements) {
                const cells = [element.title || "/", formatHealthValue(element)];
                const styles = [
                    { font: fontBold, size: 8.8 },
                    { font, size: 8.8 },
                ];
                const rowHeight = measureHealthRow(cells, regularWidths, styles, 25);
                if (yOffset - rowHeight < healthBottom) {
                    drawContinuationBanner(categoryTitle, bannerColor);
                    drawHealthBanner(subcategory.title, lightenColor(bannerColor, 0.42), true);
                }
                drawPaginatedHealthRow(cells, regularWidths, styles, 25, () => {
                    drawContinuationBanner(categoryTitle, bannerColor);
                    drawHealthBanner(subcategory.title, lightenColor(bannerColor, 0.42), true);
                });
            }

            yOffset -= 10;
        }

        yOffset -= 6;
    }

    // ==================== FINAL PAGE - SCORING ====================
    
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    yOffset = pageHeight - margin;

    if (isOrmozHealthReport) {
        page.drawText("PODPISI IN OCENA", {
            x: margin,
            y: yOffset,
            size: 14,
            font: fontBold,
            color: rgb(0, 0, 0),
        });
        yOffset -= 55;

        page.drawText("Podpis dijaka/dijakinje:", {
            x: margin,
            y: yOffset,
            size: 11,
            font,
            color: rgb(0, 0, 0),
        });
        page.drawLine({
            start: { x: margin + 135, y: yOffset - 3 },
            end: { x: pageWidth / 2 - 15, y: yOffset - 3 },
            thickness: 0.5,
            color: rgb(0, 0, 0),
        });

        page.drawText("Podpis mentorja/ice:", {
            x: pageWidth / 2 + 10,
            y: yOffset,
            size: 11,
            font,
            color: rgb(0, 0, 0),
        });
        page.drawLine({
            start: { x: pageWidth / 2 + 130, y: yOffset - 3 },
            end: { x: pageWidth - margin, y: yOffset - 3 },
            thickness: 0.5,
            color: rgb(0, 0, 0),
        });

        yOffset -= 55;
        page.drawText("Ocena:", {
            x: margin,
            y: yOffset,
            size: 11,
            font,
            color: rgb(0, 0, 0),
        });
        page.drawLine({
            start: { x: margin + 45, y: yOffset - 3 },
            end: { x: margin + 145, y: yOffset - 3 },
            thickness: 0.5,
            color: rgb(0, 0, 0),
        });
    } else {
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
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
};
