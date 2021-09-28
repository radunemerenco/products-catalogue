import {PDFDocument, PDFFont, PDFPage, StandardFonts} from "pdf-lib";

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

export type Fonts = Partial<{
  [key in StandardFonts]: PDFFont
}>

export interface CreateProductCardProps {
  pdfDoc: PDFDocument;
  page: PDFPage;
  fonts: Fonts;
  startCoordinates: StartCoordinates;
  product: Product;
  cardDimensions: Dimensions;
}

interface CreateNewPageProps {
  pdfDoc: PDFDocument;
  currentPageIndex: number;
  products: Product[];
  fonts: Fonts;
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
