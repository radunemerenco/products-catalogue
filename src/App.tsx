import { useEffect, useState } from "react";
import "./styles.css";
import PdfViewer from "./PdfViewer";
import products from "./resources/products";
import merchant from "./resources/merchant";
import pdfService from "./resources/services/pdfService";


export default function App() {
  const [pdfBytes, setPdfBytes] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      const pdfBytes = await pdfService.createProductsCatalogueDocument(products, merchant)
      setPdfBytes(pdfBytes);
    })()
  }, []);

  return (
    <div className="App">
      <PdfViewer pdfBytes={pdfBytes} />
    </div>
  );
}
