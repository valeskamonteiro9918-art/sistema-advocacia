// Gerador mínimo de arquivos .docx (Word) sem dependências externas.
// Padrão do escritório: Arial 11, espaçamento 1,5, A4, margens ABNT (3 cm esquerda/superior, 2 cm direita/inferior).

export type DocxParagraph = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right' | 'both';
  size?: number; // em pontos (padrão 11)
  spacingAfter?: number; // em twips (padrão 120)
  indentFirstLine?: boolean;
};

const encoder = new TextEncoder();

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // remove caracteres de controle inválidos em XML
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

let crcTable: Uint32Array | null = null;
function crc32(bytes: Uint8Array) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n: number) { return [n & 0xff, (n >>> 8) & 0xff]; }
function u32(n: number) { return [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]; }

// ZIP sem compressão (método "store"), suficiente e aceito pelo Word.
function zipStore(files: { name: string; data: Uint8Array }[]) {
  const chunks: number[][] = [];
  const central: number[][] = [];
  let offset = 0;
  const dosTime = 0x0000;
  const dosDate = 0x5821; // 01/01/2024
  files.forEach(file => {
    const nameBytes = Array.from(encoder.encode(file.name));
    const crc = crc32(file.data);
    const local = [
      ...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(dosTime), ...u16(dosDate),
      ...u32(crc), ...u32(file.data.length), ...u32(file.data.length), ...u16(nameBytes.length), ...u16(0), ...nameBytes
    ];
    chunks.push(local, Array.from(file.data));
    central.push([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(dosTime), ...u16(dosDate),
      ...u32(crc), ...u32(file.data.length), ...u32(file.data.length), ...u16(nameBytes.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...nameBytes
    ]);
    offset += local.length + file.data.length;
  });
  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const end = [
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length),
    ...u32(centralSize), ...u32(offset), ...u16(0)
  ];
  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let pos = 0;
  [...chunks, ...central, end].forEach(part => { out.set(part, pos); pos += part.length; });
  return out;
}

function paragraphXml(p: DocxParagraph) {
  const size = Math.round((p.size || 11) * 2);
  const jc = p.align || 'both';
  const props = [
    `<w:spacing w:before="0" w:after="${p.spacingAfter ?? 120}" w:line="360" w:lineRule="auto"/>`,
    p.indentFirstLine ? '<w:ind w:firstLine="709"/>' : '',
    `<w:jc w:val="${jc}"/>`
  ].join('');
  const runProps = [
    '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial" w:eastAsia="Arial"/>',
    p.bold ? '<w:b/>' : '',
    p.italic ? '<w:i/>' : '',
    `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>`
  ].join('');
  const text = p.text === '' ? '' : `<w:t xml:space="preserve">${escapeXml(p.text)}</w:t>`;
  return `<w:p><w:pPr>${props}</w:pPr><w:r><w:rPr>${runProps}</w:rPr>${text}</w:r></w:p>`;
}

export function buildDocx(paragraphs: DocxParagraph[]): Uint8Array {
  const body = paragraphs.map(paragraphXml).join('');
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1701" w:right="1134" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial" w:eastAsia="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>`;
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;
  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  return zipStore([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypes) },
    { name: '_rels/.rels', data: encoder.encode(rootRels) },
    { name: 'word/document.xml', data: encoder.encode(documentXml) },
    { name: 'word/styles.xml', data: encoder.encode(stylesXml) },
    { name: 'word/_rels/document.xml.rels', data: encoder.encode(docRels) }
  ]);
}

// Converte um texto simples (linhas) em parágrafos formatados: títulos centralizados,
// subtítulos em negrito e corpo justificado.
export function textToParagraphs(text: string): DocxParagraph[] {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  return lines.map(raw => {
    const line = raw.trimEnd();
    if (!line.trim()) return { text: '', spacingAfter: 0 };
    const letters = line.replace(/[^A-Za-zÀ-ÿ]/g, '');
    const isUpper = letters.length > 3 && letters === letters.toUpperCase();
    const isRoman = /^[IVXL]+\.\s/.test(line.trim()) || /^(CLÁUSULA|CLAUSULA)\s/i.test(line.trim());
    if (isUpper && !isRoman && line.length <= 70 && !line.trim().startsWith('[')) return { text: line.trim(), bold: true, align: 'center' as const };
    if (isRoman && line.length <= 110) return { text: line.trim(), bold: true, align: 'left' as const };
    if (/^(Serra\/ES,|Termos em que|Nestes termos|Pede deferimento|Local e data)/i.test(line.trim())) return { text: line.trim(), align: 'left' as const };
    if (/^_{5,}/.test(line.trim()) || /^(Dra\. Valeska Monteiro|VALESKA MONTEIRO|OAB\/ES)/.test(line.trim())) return { text: line.trim(), align: 'center' as const };
    return { text: line.trim(), align: 'both' as const, indentFirstLine: line.length > 90 };
  });
}

export function downloadDocx(filename: string, paragraphs: DocxParagraph[]) {
  const bytes = buildDocx(paragraphs);
  const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.toLowerCase().endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
