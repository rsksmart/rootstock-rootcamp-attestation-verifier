const CANVAS_SCALE = 2;

export async function exportElementAsPng(
  el: HTMLElement,
  filename: string,
): Promise<void> {
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(el, {
    scale: CANVAS_SCALE,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#000000",
    logging: false,
  });
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png", 1.0);
  a.download = filename;
  a.click();
}

export async function exportElementAsPdf(
  el: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const canvas = await html2canvas(el, {
    scale: CANVAS_SCALE,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#000000",
    logging: false,
  });
  const imgData = canvas.toDataURL("image/png", 1.0);
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = canvas.width / canvas.height;
  let w = pageW;
  let h = pageW / ratio;
  if (h > pageH) {
    h = pageH;
    w = pageH * ratio;
  }
  const x = (pageW - w) / 2;
  const y = (pageH - h) / 2;
  pdf.addImage(imgData, "PNG", x, y, w, h, undefined, "FAST");
  pdf.save(filename);
}
