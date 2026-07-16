import { zipSync, strToU8 } from 'fflate';
import { stripDocXml, extractDocxText } from '../lib/docText';

describe('stripDocXml', () => {
  it('retire le balisage et préserve les paragraphes', () => {
    const xml = '<w:document><w:p><w:r><w:t>Les fractions</w:t></w:r></w:p>'
      + '<w:p><w:r><w:t>Un demi = 1/2</w:t></w:r></w:p></w:document>';
    expect(stripDocXml(xml)).toBe('Les fractions\nUn demi = 1/2');
  });

  it('décode les entités XML', () => {
    expect(stripDocXml('<w:p><w:t>a &lt; b &amp; c</w:t></w:p>')).toBe('a < b & c');
  });
});

describe('extractDocxText', () => {
  function fakeDocx(xml: string): string {
    const zip = zipSync({ 'word/document.xml': strToU8(xml) });
    return Buffer.from(zip).toString('base64');
  }

  it('extrait le texte de word/document.xml', () => {
    const b64 = fakeDocx('<w:p><w:t>Leçon de géométrie</w:t></w:p>');
    expect(extractDocxText(b64)).toBe('Leçon de géométrie');
  });

  it('renvoie null pour une archive sans document.xml ou illisible', () => {
    const zip = zipSync({ 'autre.txt': strToU8('x') });
    expect(extractDocxText(Buffer.from(zip).toString('base64'))).toBeNull();
    expect(extractDocxText('pasdubase64valide!!!')).toBeNull();
  });
});
