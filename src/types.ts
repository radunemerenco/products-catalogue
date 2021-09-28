import { PDFDocument, PDFPage } from "pdf-lib";

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
}

export interface CreateProductCardProps {
  pdfDoc: PDFDocument;
  page: PDFPage;
  startCoordinates: StartCoordinates;
  product: Product;
  cardDimensions: Dimensions;
}

interface CreateNewPageProps {
  pdfDoc: PDFDocument;
  currentPage: number;
  products: Product[];
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
