// Empreinte (SHA-256) d'un mot de passe, à copier dans config.js (champ « admin »).
// Lancer depuis la racine :  node tests/empreinte.mjs "nouveau mot de passe"
// Le mot de passe lui-même n'est jamais écrit dans le dépôt.
import { createHash } from 'node:crypto';

const mdp = process.argv[2];
if (!mdp) { console.error('Usage : node tests/empreinte.mjs "mot de passe"'); process.exit(1); }
console.log(`admin:    '${createHash('sha256').update(mdp, 'utf8').digest('hex')}',`);
