import type { ExportFormat } from '../types/billing';
import type { ReportDef } from '../data/reports';

interface StoredFile {
  filename: string;
  blob: Blob;
}

const files = new Map<string, StoredFile>();

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function buildCsv(report: ReportDef, rows: (string | number)[][], range: string): string {
  const lines = [
    `# ${report.name}`,
    `# Data type: ${report.dataType}`,
    `# Range: ${range}`,
    `# Organisation: Karoo Digital (Pty) Ltd`,
    report.columns.map(csvCell).join(','),
    ...rows.map((row) => row.map(csvCell).join(','))
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

function xml(value: string | number): string {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildExcel(report: ReportDef, rows: (string | number)[][], range: string): string {
  const header = report.columns.map((col) => `<Cell><Data ss:Type="String">${xml(col)}</Data></Cell>`).join('');
  const body = rows.map((row) => `<Row>${row.map((cell) => {
    const numeric = typeof cell === 'number';
    return `<Cell><Data ss:Type="${numeric ? 'Number' : 'String'}">${xml(cell)}</Data></Cell>`;
  }).join('')}</Row>`).join('');
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="${xml(report.name).slice(0, 31)}">
<Table>
<Row><Cell><Data ss:Type="String">${xml(report.name)} — ${xml(report.dataType)}</Data></Cell></Row>
<Row><Cell><Data ss:Type="String">${xml(range)} · Karoo Digital (Pty) Ltd</Data></Cell></Row>
<Row>${header}</Row>
${body}
</Table>
</Worksheet>
</Workbook>`;
}

function pdfEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, '?');
}

function buildPdf(report: ReportDef, rows: (string | number)[][], range: string): Uint8Array {
  const lines = [
    report.name,
    `Data type: ${report.dataType}`,
    `Range: ${range}`,
    'Karoo Digital (Pty) Ltd',
    '',
    report.columns.join('  |  '),
    ...rows.map((row) => row.join('  |  '))
  ];
  let stream = 'BT\n/F1 11 Tf\n40 800 Td\n14 TL\n';
  lines.forEach((line, index) => {
    stream += index === 0 ? `(${pdfEscape(line)}) Tj\n` : `T* (${pdfEscape(line)}) Tj\n`;
  });
  stream += 'ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  let body = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    body += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(body);
}

export function storeExportFile(id: string, report: ReportDef, rows: (string | number)[][], format: ExportFormat, range: string): string {
  const base = `${slug(report.name)}-${slug(range)}`;
  let filename = `${base}.csv`;
  let blob: Blob;
  if (format === 'CSV') {
    blob = new Blob([buildCsv(report, rows, range)], { type: 'text/csv;charset=utf-8' });
  } else if (format === 'Excel') {
    filename = `${base}.xls`;
    blob = new Blob([buildExcel(report, rows, range)], { type: 'application/vnd.ms-excel' });
  } else {
    filename = `${base}.pdf`;
    const bytes = buildPdf(report, rows, range);
    const pdf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    blob = new Blob([pdf as BlobPart], { type: 'application/pdf' });
  }
  files.set(id, { filename, blob });
  return filename;
}

export function hasExportFile(id: string): boolean {
  return files.has(id);
}

export function downloadExport(id: string): boolean {
  const file = files.get(id);
  if (!file) return false;
  const url = URL.createObjectURL(file.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}
