import { Product } from "../types";
import { riceImageBase64, qrImageBase64 } from "./images";

const products: Product[] = Array.from({ length: 40 }).map((_, index) => ({
  name: `Product Name ${index + 1}`,
  image: riceImageBase64,
  qrImage: qrImageBase64
}));

export default products;
