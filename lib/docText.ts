import { unzipSync, strFromU8 } from 'fflate';

// Extraction du texte d'un document Word (.docx) : un .docx est une archive
// zip dont le texte vit dans word/document.xml. On dézippe (fflate, pur JS)
// puis on retire le balisage XML en préservant les fins de paragraphes.

/** Retire le balisage XML d'un document.xml Word en gardant les sauts de paragraphe. */
export function stripDocXml(xml: string): string {
  return xml
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[\r\n\s]/g, '');
  if (typeof atob === 'function') {
    const bin = atob(clean);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  // environnement Node (tests)
  return new Uint8Array(Buffer.from(clean, 'base64'));
}

/**
 * Extrait le texte d'un fichier .docx fourni en base64.
 * Renvoie null si l'archive est illisible ou sans texte.
 */
export function extractDocxText(base64: string): string | null {
  try {
    const files = unzipSync(base64ToBytes(base64));
    const doc = files['word/document.xml'];
    if (!doc) return null;
    const text = stripDocXml(strFromU8(doc));
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}
