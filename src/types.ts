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

export interface Merchant {
  name: string;
  owner: string;
  Programme: {
    id: string;
    name: string;
  }
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
  fonts: Fonts;
}
export type CreateNewPage = (props: CreateNewPageProps) => PDFPage;

interface GetCardDimensionsProps {
  page: PDFPage;
}
export type GetCardDimensions = (props: GetCardDimensionsProps) => Dimensions;

interface DrawProductsGridProps {
  page: PDFPage;
  currentPageIndex: number;
  products: Product[];
}
export type DrawProductsGrid = (props: DrawProductsGridProps) => void;

interface DrawPageHeaderProps {
  page: PDFPage;
  merchant: Merchant;
  fonts: Fonts;
}
export type DrawPageHeader = (props: DrawPageHeaderProps) => void;
