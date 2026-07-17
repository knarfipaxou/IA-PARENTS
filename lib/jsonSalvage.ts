// Récupération d'une réponse IA tronquée : quand un JSON est coupé en plein
// milieu (limite de tokens), on récupère tous les objets COMPLETS du tableau
// "questions" au lieu d'échouer avec « format inattendu ».

/**
 * Extrait les objets complets du tableau `key` d'un JSON potentiellement
 * tronqué. Renvoie [] si rien d'exploitable.
 */
export function salvageArray(text: string, key = 'questions'): any[] {
  const keyIdx = text.indexOf(`"${key}"`);
  if (keyIdx < 0) return [];
  const arrStart = text.indexOf('[', keyIdx);
  if (arrStart < 0) return [];

  const items: any[] = [];
  let i = arrStart + 1;
  while (i < text.length) {
    // début du prochain objet
    while (i < text.length && text[i] !== '{' && text[i] !== ']') i++;
    if (i >= text.length || text[i] === ']') break;
    // objet équilibré (en ignorant les accolades dans les chaînes)
    let depth = 0;
    let inStr = false;
    let esc = false;
    const start = i;
    let end = -1;
    for (; i < text.length; i++) {
      const c = text[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    if (end < 0) break; // objet tronqué : on s'arrête, les précédents sont sauvés
    try {
      items.push(JSON.parse(text.slice(start, end + 1)));
    } catch {
      // objet corrompu : on l'ignore et on continue
    }
    i = end + 1;
  }
  return items;
}
