import { PDFDocument, rgb } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"


interface JsonData {
  title: string
  description: string
  categories: Record<
    string,
    {
      title: string
      description: string
      subcategories: Record<
        string,
        {
          title: string
          description: string | null
          elements: Record<
            string,
            {
              title: string
              unit: string | null
              hint: string | null
              value: string | boolean | string[] | null
            }
          >
        }
      >
    }
  >
}

const fetchFont = async (url: string): Promise<Uint8Array> => {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

export const generatePdfFromJson = async (
  data: JsonData,
): Promise<Blob> => {
  if (!data || !data.categories) {
    throw new Error("Invalid data: 'categories' key is missing.")
  }

  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const fontBytes = await fetchFont("/fonts/Roboto-Regular.ttf")
  const fontBoldBytes = await fetchFont("/fonts/Roboto-Bold.ttf")
  const font = await pdfDoc.embedFont(fontBytes)
  const fontBold = await pdfDoc.embedFont(fontBoldBytes)

  const pageWidth = 595
  const pageHeight = 842
  const margin = 40
  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let yOffset = pageHeight - margin

  const wrapText = (text: string, maxWidth: number, font: any, fontSize: number) => {
    const words = text.split(" ")
    const lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = font.widthOfTextAtSize(currentLine + " " + word, fontSize)
      if (width < maxWidth) {
        currentLine += " " + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines
  }

  const drawWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    font: any,
    fontSize: number,
    color: [number, number, number],
  ): number => {
    const lines = wrapText(text, maxWidth, font, fontSize)
    lines.forEach((line, i) => {
      page.drawText(line, {
        x,
        y: y - i * (fontSize + 2),
        size: fontSize,
        font,
        color: rgb(...color),
      })
    })
    return lines.length * (fontSize + 2)
  }

  const drawTable = (tableData: string[][], x: number, y: number, colWidths: number[]) => {
    let currentY = y
    tableData.forEach((row) => {
      let currentX = x
      let rowHeight = 20

      row.forEach((cell, colIndex) => {
        const lines = wrapText(cell || "—", colWidths[colIndex] - 20, font, 10)
        const cellHeight = lines.length * (10 + 2) + 10
        rowHeight = Math.max(rowHeight, cellHeight)
      })

      row.forEach((cell, colIndex) => {
        const lines = wrapText(cell || "—", colWidths[colIndex] - 20, font, 10)
        lines.forEach((line, lineIndex) => {
          page.drawText(line, {
            x: currentX + 10,
            y: currentY - 15 - lineIndex * 12,
            size: 10,
            font: colIndex === 1 ? fontBold : font,
            color: rgb(0, 0, 0),
          })
        })

        page.drawRectangle({
          x: currentX,
          y: currentY - rowHeight,
          width: colWidths[colIndex],
          height: rowHeight,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        })
        currentX += colWidths[colIndex]
      })

      currentY -= rowHeight + 5
      if (currentY < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight])
        currentY = pageHeight - margin
      }
    })
    return currentY
  }

  const drawHeader = () => {


    yOffset -= 45

    page.drawLine({
      start: { x: margin, y: yOffset },
      end: { x: pageWidth - margin, y: yOffset },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    })
    yOffset -= 20

    const titleWidth = fontBold.widthOfTextAtSize(data.title, 16)
    page.drawText(data.title, {
      x: (pageWidth - titleWidth) / 2,
      y: yOffset,
      size: 16,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    yOffset -= 20

    const descHeight = drawWrappedText(data.description, margin, yOffset, pageWidth - 2 * margin, font, 12, [
      0.2, 0.2, 0.2,
    ])
    yOffset -= descHeight + 10

    const currentDate = new Date().toLocaleDateString("sl-SI")
    page.drawText(`Narejeno ${currentDate}`, {
      x: pageWidth - margin - 100,
      y: pageHeight - margin / 2,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
  }

  drawHeader()

  const categories = Object.keys(data.categories)
  for (const categoryKey of categories) {
    const category = data.categories[categoryKey]

    page.drawText(category.title, {
      x: margin,
      y: yOffset,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    })
    yOffset -= 20

    const catDescHeight = drawWrappedText(category.description, margin, yOffset, pageWidth - 2 * margin, font, 12, [
      0.2, 0.2, 0.2,
    ])
    yOffset -= catDescHeight + 10

    const subcategories = Object.keys(category.subcategories)
    for (const subcategoryKey of subcategories) {
      const subcategory = category.subcategories[subcategoryKey]

      const tableData: string[][] = []
      for (const elementKey in subcategory.elements) {
        const element = subcategory.elements[elementKey]
        let valueWithUnit = ""

        if (typeof element.value === "boolean") {
          valueWithUnit = element.value ? "DA" : "NE"
        } else if (Array.isArray(element.value)) {
          valueWithUnit = element.value.join(", ")
        } else {
          valueWithUnit = `${element.value || "—"} ${element.unit || ""}`.trim()
        }

        tableData.push([element.title || "—", valueWithUnit])
      }

      const colWidths = [200, 315]
      const estimatedTableHeight = tableData.length * 25
      const estDescHeight = subcategory.description
        ? wrapText(subcategory.description, pageWidth - 2 * margin, font, 10).length * 12 + 10
        : 0
      const requiredHeight = 15 + estDescHeight + estimatedTableHeight + 30

      if (yOffset - requiredHeight < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight])
        yOffset = pageHeight - margin
      }

      page.drawText(subcategory.title, {
        x: margin + 10,
        y: yOffset,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      })
      yOffset -= 15

      if (subcategory.description) {
        const descHeight = drawWrappedText(
          subcategory.description,
          margin + 10,
          yOffset,
          pageWidth - 2 * margin - 10,
          font,
          10,
          [0.2, 0.2, 0.2],
        )
        yOffset -= descHeight + 5
      }

      yOffset = drawTable(tableData, margin + 10, yOffset, colWidths)
      yOffset -= 20
    }

    page.drawLine({
      start: { x: margin, y: yOffset },
      end: { x: pageWidth - margin, y: yOffset },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    })
    yOffset -= 20
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: "application/pdf" })
}
