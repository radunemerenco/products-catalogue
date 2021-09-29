import { useEffect, useState } from "react";
import {PDFDocument, PDFFont, rgb, StandardFonts} from "pdf-lib";
import type { PDFPage } from "pdf-lib";
// import { decode } from "base64-arraybuffer";
import {
  CreateProductCardProps,
  CreateNewPage,
  GetCardDimensions,
  DrawProductsGrid, Fonts, DrawPageHeader, StartCoordinates, DrawPageMeta, DrawLogo
} from "./types";

import "./styles.css";
import PdfViewer from "./PdfViewer";
import products from "./resources/products";
import merchant from "./resources/merchant";
import {logoImageBase64} from "./resources/images";

const BASE_PAGE_WIDTH = 595;
const PRODUCT_CARD_WIDTH = 185;
const PRODUCT_CARD_HEIGHT = 130;
const PAGE_PADDING = {
  TOP: 21,
  RIGHT: 21,
  BOTTOM: 21,
  LEFT: 21
};
const GRID_ITEMS = {
  HORIZONTAL: 3,
  VERTICAL: 5
};
const ITEMS_PER_PAGE = GRID_ITEMS.HORIZONTAL * GRID_ITEMS.VERTICAL;

const COLORS = {
  text: rgb(0.24, 0.24, 0.24),
  accent: rgb(0.14, 0.47, 0.69),
  grey: rgb(0.78, 0.78, 0.78)
};

const getResponsiveDimension = (dimension: number, page: PDFPage): number => {
  const pageWidth = page.getWidth();
  const aspectRation = pageWidth / BASE_PAGE_WIDTH;

  return dimension * aspectRation;
};

export default function App() {
  const [pdfBytes, setPdfBytes] = useState<string | undefined>();

  useEffect(() => {
    const createProductCard = async ({
      pdfDoc,
      page,
      fonts,
      startCoordinates,
      product,
      cardDimensions
    }: CreateProductCardProps) => {
      const topStartCoordinates = {
        x: startCoordinates.x,
        y: startCoordinates.y + cardDimensions.height
      };

      const cardPaddings = getResponsiveDimension(10, page);
      const columnGap = getResponsiveDimension(15, page);

      const ricePdfImage = await pdfDoc.embedPng(product.image);
      const qrPdfImage = await pdfDoc.embedPng(product.qrImage);

      const imageLat =
        (cardDimensions.width - cardPaddings * 2 - columnGap) / 2;
      const imageDimensions = {
        width: imageLat, //getResponsiveDimension(75, page),
        height: imageLat
      };

      // console.log({
      //   startCoordinates,
      //   topStartCoordinates,
      //   cardDimensions,
      //   imageDimensions,
      //   cardPaddings,
      //   columnGap
      // });

      const imageYPosition =
        topStartCoordinates.y - cardPaddings - imageDimensions.height;

      page.drawImage(ricePdfImage, {
        x: topStartCoordinates.x + cardPaddings,
        y: imageYPosition,
        width: imageDimensions.width,
        height: imageDimensions.height
      });

      page.drawImage(qrPdfImage, {
        x:
          topStartCoordinates.x +
          cardDimensions.width -
          imageDimensions.width -
          cardPaddings,
        y: imageYPosition,
        width: imageDimensions.width,
        height: imageDimensions.height
      });

      const lineHeight = getResponsiveDimension(15, page);

      const productNameYPosition =
        topStartCoordinates.y -
        imageDimensions.height -
        cardPaddings -
        getResponsiveDimension(5, page) -
        lineHeight;

      page.drawText(product.name, {
        x: topStartCoordinates.x + cardPaddings,
        y: productNameYPosition,
        // font: timesRomanFont,
        size: getResponsiveDimension(12, page),
        color: COLORS.text,
        lineHeight
      });

      const productQuantityString = product.quantity > 1 ? product.quantity : '';

      const priceLabel = `${product.price} ${product.currency}/${productQuantityString}${product.unitType}`

      const textWidth = fonts["Helvetica-Bold"]?.widthOfTextAtSize(
        priceLabel,
        getResponsiveDimension(12, page)
      ) || 0;

      page.drawText(priceLabel, {
        x: startCoordinates.x - cardPaddings + cardDimensions.width - textWidth,
        y:  startCoordinates.y + cardPaddings,
        font: fonts["Helvetica-Bold"],
        size: getResponsiveDimension(12, page),
        color: COLORS.text,
        lineHeight
      });
    };

    const getCardDimensions: GetCardDimensions = ({ page }) => ({
      width: getResponsiveDimension(PRODUCT_CARD_WIDTH, page),
      height: getResponsiveDimension(PRODUCT_CARD_HEIGHT, page)
    });

    const drawProductsGrid: DrawProductsGrid = ({
      page,
      products,
      currentPageIndex,
    }) => {
      const totalPages = Math.floor(products.length / ITEMS_PER_PAGE);
      const itemsInPage =
        currentPageIndex !== totalPages
          ? ITEMS_PER_PAGE
          : products.length % ITEMS_PER_PAGE;

      console.log({itemsInPage});
      const cardDimensions = getCardDimensions({page});

      const rowsInPage = Math.ceil(itemsInPage / GRID_ITEMS.HORIZONTAL);
      const columnsInPage = itemsInPage / GRID_ITEMS.VERTICAL;
      console.log({rowsInPage, columnsInPage});

      // Draw horizontal lines
      const horizontalLinesInPage = rowsInPage + 1;
      Array.from({
        length: horizontalLinesInPage
      }).map((_, index) => {
        const isFirstHorizontalLine = index === horizontalLinesInPage - 1;
        const isLastHorizontalLine = index === 0;


        const isLinePartialWidth = (rowsInPage === 1 && isFirstHorizontalLine) || isLastHorizontalLine

        let columnsInRow = isLinePartialWidth
          ? (itemsInPage % GRID_ITEMS.HORIZONTAL || GRID_ITEMS.HORIZONTAL)
          : GRID_ITEMS.HORIZONTAL;

        page.drawLine({
          start: {
            x: PAGE_PADDING.LEFT,
            y: ((GRID_ITEMS.VERTICAL - rowsInPage) + index) * cardDimensions.height + PAGE_PADDING.BOTTOM
          },
          end: {
            x:
              cardDimensions.width * columnsInRow +
              PAGE_PADDING.LEFT,
            y: ((GRID_ITEMS.VERTICAL - rowsInPage) + index) * cardDimensions.height + PAGE_PADDING.BOTTOM
          },
          thickness: 2,
          color: COLORS.text,
          dashArray: [6, 6]
        });
      });

      // Draw vertical lines
      const verticalLinesInPage = (itemsInPage > GRID_ITEMS.HORIZONTAL ? GRID_ITEMS.HORIZONTAL : itemsInPage) + 1;
      Array.from({
        length: verticalLinesInPage
      }).map((_, index) => {
        const rowsInPage = Math.ceil(itemsInPage / GRID_ITEMS.HORIZONTAL);
        const isFullHeight = index <= ((itemsInPage % GRID_ITEMS.HORIZONTAL) || GRID_ITEMS.HORIZONTAL);
        const rowsInColumn = isFullHeight ? rowsInPage : rowsInPage - 1;

        console.log({rowsInPage, isFullHeight, rowsInColumn})

        page.drawLine({
          start: {
            x: index * cardDimensions.width + PAGE_PADDING.LEFT,
            y:
              cardDimensions.height * GRID_ITEMS.VERTICAL +
              PAGE_PADDING.BOTTOM
          },
          end: {
            x: index * cardDimensions.width + PAGE_PADDING.LEFT,
            y: cardDimensions.height * (GRID_ITEMS.VERTICAL - rowsInColumn) + PAGE_PADDING.BOTTOM
          },
          thickness: 2,
          color: COLORS.text,
          dashArray: [6, 6]
        });
      })
    }

    const drawLogo: DrawLogo = async ({
      pdfDoc,
      page,
      // startCoordinates,
    }) => {
      const logoPdfImage = await pdfDoc.embedPng(logoImageBase64);
      const logoWidth = getResponsiveDimension(116, page);
      const logoHeight = getResponsiveDimension(32, page);
      const rightAlignment = getResponsiveDimension(PAGE_PADDING.RIGHT, page);
      const topAlignment = getResponsiveDimension(PAGE_PADDING.TOP, page);

      page.drawImage(logoPdfImage, {
        x: page.getWidth() - rightAlignment - logoWidth,
        y: page.getHeight() - topAlignment - logoHeight,
        width: logoWidth,
        height: logoHeight
      });
    }

    const drawPageMeta: DrawPageMeta = ({
      page,
      fonts,
      startCoordinates,
      label,
      value
    }) => {
      const labelFontSize = getResponsiveDimension(8, page);
      const valueFontSize = getResponsiveDimension(14, page);
      const labelTextHeight =  fonts["Helvetica"]?.heightAtSize(labelFontSize) || 0;
      const valueTextHeight =  fonts["Helvetica-Bold"]?.heightAtSize(valueFontSize) || 0;
      const labelBottomStartCoordinates = {
        x: startCoordinates.x,
        y: startCoordinates.y - labelTextHeight - getResponsiveDimension(20, page)
      };
      const valueBottomStartCoordinates = {
        x: startCoordinates.x,
        y: labelBottomStartCoordinates.y - valueTextHeight - getResponsiveDimension(3, page),
      };

      page.drawText(label, {
        x: labelBottomStartCoordinates.x,
        y: labelBottomStartCoordinates.y,
        font: fonts.Helvetica,
        size: labelFontSize,
        color: COLORS.text,
        lineHeight: labelFontSize * 1.725,
      });

      page.drawText(value, {
        x: valueBottomStartCoordinates.x,
        y: valueBottomStartCoordinates.y,
        font: fonts["Helvetica-Bold"],
        size: valueFontSize,
        color: COLORS.text,
        lineHeight: valueFontSize * 1.725,
      });

      return valueBottomStartCoordinates;
    }

    const drawPageHeader: DrawPageHeader = async ({
      pdfDoc,
      page,
      merchant,
      fonts,
    }) => {
      // Draw page title
      const pageTitleHeight =  fonts["Helvetica-Bold"]?.heightAtSize(
        getResponsiveDimension(28, page)
      ) || 0;
      const leftAlignment = getResponsiveDimension(PAGE_PADDING.LEFT, page)
      const titleTopAlignment = page.getSize().height - pageTitleHeight - getResponsiveDimension(PAGE_PADDING.TOP, page);
      const titleLineHeight = getResponsiveDimension(32.81, page)

      page.drawText('Product Catalog', {
        x: leftAlignment,
        y: titleTopAlignment,
        font: fonts["Helvetica-Bold"],
        size: getResponsiveDimension(28, page),
        color: COLORS.accent,
        lineHeight: titleLineHeight
      });

      await drawLogo({ pdfDoc, page });

      const businessNameBottomStartCoordinates = drawPageMeta({
        page,
        fonts,
        startCoordinates: {
          x: leftAlignment,
          y: titleTopAlignment,
        },
        label: 'Business Name',
        value: merchant.name
      })

      const ownerNameBottomStartCoordinates = drawPageMeta({
        page,
        fonts,
        startCoordinates: businessNameBottomStartCoordinates,
        label: 'Owner Name',
        value: merchant.owner
      })

      page.drawLine({
        start: {
          x: businessNameBottomStartCoordinates.x,
          y: businessNameBottomStartCoordinates.y - getResponsiveDimension(8, page)
        },
        end: {
          x: page.getWidth() - businessNameBottomStartCoordinates.x,
          y: businessNameBottomStartCoordinates.y - getResponsiveDimension(8, page)
        },
        thickness: 0.5,
        color: COLORS.text,
      });

      page.drawLine({
        start: {
          x: ownerNameBottomStartCoordinates.x,
          y: ownerNameBottomStartCoordinates.y - getResponsiveDimension(8, page)
        },
        end: {
          x: page.getWidth() - ownerNameBottomStartCoordinates.x,
          y: ownerNameBottomStartCoordinates.y - getResponsiveDimension(8, page)
        },
        thickness: 0.5,
        color: COLORS.text,
      });

      const programmeNumberBottomStartCoordinates = drawPageMeta({
        page,
        fonts,
        startCoordinates: {
          x: leftAlignment + getCardDimensions({page}).width,
          y: titleTopAlignment,
        },
        label: 'Programme Number',
        value: merchant.Programme.id
      });

      drawPageMeta({
        page,
        fonts,
        startCoordinates: programmeNumberBottomStartCoordinates,
        label: 'Programme Name',
        value: merchant.Programme.name
      });
    }

    const createNewPage: CreateNewPage = ({
      pdfDoc,
      fonts
    }) => {
      const page = pdfDoc.addPage();
      page.setWidth(595);
      page.setHeight(842);

      if (fonts.Helvetica) {
        page.setFont(fonts.Helvetica)
      }

      // page.drawLine({
      //   start: { x: 25, y: page.getHeight() / 2 },
      //   end: { x: page.getWidth() - 25, y: page.getHeight() / 2 },
      //   thickness: 2,
      //   color: rgb(0, 0, 0),
      //   dashArray: [6, 6]
      // });

      return page;
    };

    (async () => {
      // PDF Creation
      const pdfDoc = await PDFDocument.create();
      // page.drawText("You can create PDFssss!");
      const fonts: Fonts = {
        [StandardFonts.Helvetica]: await pdfDoc.embedFont(StandardFonts.Helvetica),
        [StandardFonts.HelveticaBold]: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      }

      let page: PDFPage | null = null;

      console.log({ ITEMS_PER_PAGE });
      const promises: Promise<void>[] = await products.map(async (product, index) => {
        const currentIndex = index % ITEMS_PER_PAGE;
        const currentPageIndex = Math.floor(index / ITEMS_PER_PAGE);
        // console.log({
        //   currentPageIndex,
        //   currentIndex,
        //   currentPage12: pages[currentPageIndex],
        //   pages,
        //   product: product.name
        // });

        if (!currentIndex) {
          page = createNewPage({
            pdfDoc,
            fonts,
          });


          // TODO draw merchant and programme details. To keep this function
          //  without promises consider keeping only page creation here and
          //  moving other drawings in another function

          drawProductsGrid({
            page,
            currentPageIndex,
            products,
          });

          drawPageHeader({ pdfDoc, page, fonts, merchant })
        }

        if (!page) return;

        const cardDimensions = getCardDimensions({ page });

        const currentHorizontalIndex = currentIndex % GRID_ITEMS.HORIZONTAL;
        const currentVerticalIndex =
          Math.floor(currentIndex / GRID_ITEMS.HORIZONTAL) + 1;

        // if (currentIndex === 0 && index !== 0) {
        //   page = await createNewPage({ pdfDoc, currentPageIndex, products });
        // }

        await createProductCard({
          pdfDoc,
          page,
          fonts,
          startCoordinates: {
            x:
              cardDimensions.width * currentHorizontalIndex + PAGE_PADDING.LEFT,
            y:
              cardDimensions.height *
                (GRID_ITEMS.VERTICAL - currentVerticalIndex) +
              PAGE_PADDING.BOTTOM
          },
          product,
          cardDimensions
        });
      });

      await Promise.all(promises);

      // const pdfBytes = await pdfDoc.save();
      const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
      setPdfBytes(pdfBytes);
    })();
  }, []);

  return (
    <div className="App">
      <PdfViewer pdfBytes={pdfBytes} />
    </div>
  );
}
