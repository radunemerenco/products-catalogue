import {PDFDocument, PDFFont, PDFPage} from "pdf-lib";

export interface StartCoordinates {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Product {
  name: string;
  image: string;
  qrImage: string;
  price: number;
  currency: string;
  quantity: number;
  unitType: string;
}

export interface CreateProductCardProps {
  pdfDoc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  startCoordinates: StartCoordinates;
  product: Product;
  cardDimensions: Dimensions;
}

interface CreateNewPageProps {
  pdfDoc: PDFDocument;
  currentPageIndex: number;
  products: Product[];
  font: PDFFont;
}
export type CreateNewPage = (props: CreateNewPageProps) => PDFPage;

interface GetCardDimensionsProps {
  page: PDFPage;
}
export type GetCardDimensions = (props: GetCardDimensionsProps) => Dimensions;

interface DrawProductsGridProps {
  page: PDFPage;
  itemsInPage: number;
}
export type DrawProductsGrid = (props: DrawProductsGridProps) => void;
