import { useEffect, useState } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import type { PDFPage } from "pdf-lib";
// import { decode } from "base64-arraybuffer";
import {
  CreateProductCardProps,
  CreateNewPage,
  GetCardDimensions,
  DrawProductsGrid
} from "./types";

import "./styles.css";
import PdfViewer from "./PdfViewer";
import products from "./resources/products";

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

      const productNameYPostition =
        topStartCoordinates.y -
        imageDimensions.height -
        cardPaddings -
        getResponsiveDimension(5, page) -
        lineHeight;

      page.drawText(product.name, {
        x: topStartCoordinates.x + cardPaddings,
        y: productNameYPostition,
        // font: timesRomanFont,
        size: getResponsiveDimension(12, page),
        color: rgb(0, 0, 0),
        lineHeight
      });
    };

    const getCardDimensions: GetCardDimensions = ({ page }) => ({
      width: getResponsiveDimension(PRODUCT_CARD_WIDTH, page),
      height: getResponsiveDimension(PRODUCT_CARD_HEIGHT, page)
    });

    const drawProductsGrid: DrawProductsGrid = async ({
      page,
      itemsInPage
    }) => {
      console.log({ itemsInPage });
      const cardDimensions = getCardDimensions({ page });

      const rowsInPage = Math.ceil(itemsInPage / GRID_ITEMS.HORIZONTAL);
      const columnsInPage = itemsInPage / GRID_ITEMS.VERTICAL;
      console.log({ rowsInPage, columnsInPage });

      // Draw horizontal lines
      await Promise.all(
        Array.from({
          length: GRID_ITEMS.VERTICAL + 1
        }).map(async (_, index) => {
          await page.drawLine({
            start: {
              x:
                cardDimensions.width * GRID_ITEMS.HORIZONTAL +
                PAGE_PADDING.LEFT,
              y: index * cardDimensions.height + PAGE_PADDING.BOTTOM
            },
            end: {
              x: PAGE_PADDING.LEFT,
              y: index * cardDimensions.height + PAGE_PADDING.BOTTOM
            },
            thickness: 2,
            color: rgb(0, 0, 0),
            dashArray: [6, 6]
          });
        })
      );

      // Draw vertical lines
      await Promise.all(
        Array.from({
          length: GRID_ITEMS.HORIZONTAL + 1
        }).map(async (_, index) => {
          await page.drawLine({
            start: {
              x: index * cardDimensions.width + PAGE_PADDING.LEFT,
              y:
                cardDimensions.height * GRID_ITEMS.VERTICAL +
                PAGE_PADDING.BOTTOM
            },
            end: {
              x: index * cardDimensions.width + PAGE_PADDING.LEFT,
              y: PAGE_PADDING.BOTTOM
            },
            thickness: 2,
            color: rgb(0, 0, 0),
            dashArray: [6, 6]
          });
        })
      );
    };

    const createNewPage: CreateNewPage = async ({
      pdfDoc,
      currentPage,
      products
    }) => {
      const page = pdfDoc.addPage();
      page.setWidth(595);
      page.setHeight(842);

      const totalPages = Math.floor(products.length / ITEMS_PER_PAGE);
      const itemsInPage =
        currentPage !== totalPages
          ? ITEMS_PER_PAGE
          : products.length % ITEMS_PER_PAGE;
      await drawProductsGrid({ page, itemsInPage });

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

      let page = await createNewPage({ pdfDoc, currentPage: 0, products });

      const cardDimensions = getCardDimensions({ page });

      const promises = products.map(async (product, index) => {
        const currentIndex = index % ITEMS_PER_PAGE;
        const currentPage = Math.floor(index / ITEMS_PER_PAGE);

        const currentHorizontalIndex = currentIndex % GRID_ITEMS.HORIZONTAL;
        const currentVerticalIndex =
          Math.floor(currentIndex / GRID_ITEMS.HORIZONTAL) + 1;

        if (currentIndex === 0 && index !== 0) {
          page = await createNewPage({ pdfDoc, currentPage, products });
        }

        await createProductCard({
          pdfDoc,
          page,
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
