import { FC } from "react";

interface PdfViewerProps {
  pdfBytes?: string;
}

const PdfViewer: FC<PdfViewerProps> = ({ pdfBytes }) => {
  if (!pdfBytes) return null;

  return (
    <iframe
      title="pdf"
      src={pdfBytes}
      style={{ width: "100%", height: "95vh" }}
    />
  );
};

export default PdfViewer;
