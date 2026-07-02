import axios from "axios";
import { PDFParse } from "pdf-parse";

const extractTextFromPdf = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
};

export default extractTextFromPdf;

