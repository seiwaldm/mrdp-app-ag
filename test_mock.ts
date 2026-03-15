import { mockAntritte, mockFaecher, mockKandidaten, mockKommission, mockThemengebiete } from './src/lib/data.ts';

const findAntritt = (id) => mockAntritte.find(a => a.id === id);
const findKandidat = (id) => mockKandidaten.find(k => k.id === id);
const findFach = (id) => mockFaecher.find(f => f.id === id);

const id = "a1";
const a = findAntritt(id);
const k = a ? findKandidat(a.kandidatId) : null;
const f = a ? findFach(a.fachId) : null;

console.log({ a: !!a, k: !!k, f: !!f, valid: !!(a && k && f) });
