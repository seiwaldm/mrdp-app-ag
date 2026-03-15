import type { Antritt, Fach, Kandidat, Kommissionsmitglied, Themengebiet } from './types';

export const mockKandidaten: Kandidat[] = [
	{ id: 'k1', vorname: 'Maria', nachname: 'Huber', klasse: '5AB' },
	{ id: 'k2', vorname: 'Josef', nachname: 'Müller', klasse: '5AB' },
	{ id: 'k3', vorname: 'Anna', nachname: 'Steiner', klasse: '5CB' },
	{ id: 'k4', vorname: 'Felix', nachname: 'Gruber', klasse: '5CB' },
	{ id: 'k5', vorname: 'Lisa', nachname: 'Wimmer', klasse: '5AB' }
];

export const mockFaecher: Fach[] = [
	{ id: 'f1', bezeichnung: 'Betriebswirtschaft', kurzform: 'BWM' },
	{ id: 'f2', bezeichnung: 'Mathematik', kurzform: 'MATH' },
	{ id: 'f3', bezeichnung: 'Rechnungswesen', kurzform: 'RW' },
	{ id: 'f4', bezeichnung: 'Englisch', kurzform: 'E' },
	{ id: 'f5', bezeichnung: 'Deutsch', kurzform: 'D' }
];

export const mockThemengebiete: Themengebiet[] = [
	{ id: 't1_1', bezeichnung: 'Investitionsrechnung', fachId: 'f1' },
	{ id: 't1_2', bezeichnung: 'Kostenrechnung', fachId: 'f1' },
	{ id: 't1_3', bezeichnung: 'Marketing', fachId: 'f1' },
	{ id: 't1_4', bezeichnung: 'Personalmanagement', fachId: 'f1' },
	{ id: 't1_5', bezeichnung: 'Finanzierung', fachId: 'f1' },
	{ id: 't2_1', bezeichnung: 'Analysis', fachId: 'f2' },
	{ id: 't2_2', bezeichnung: 'Wahrscheinlichkeit', fachId: 'f2' },
	{ id: 't2_3', bezeichnung: 'Algebra', fachId: 'f2' },
	{ id: 't3_1', bezeichnung: 'Bilanzanalyse', fachId: 'f3' },
	{ id: 't3_2', bezeichnung: 'Controlling', fachId: 'f3' },
	{ id: 't4_1', bezeichnung: 'Business Communication', fachId: 'f4' },
	{ id: 't4_2', bezeichnung: 'Globalisation', fachId: 'f4' },
	{ id: 't5_1', bezeichnung: 'Literatur nach 1945', fachId: 'f5' },
	{ id: 't5_2', bezeichnung: 'Kommunikation', fachId: 'f5' }
];

export const mockKommission: Kommissionsmitglied[] = [
	{ id: 'm1', vorname: 'K.', nachname: 'Maier', pruefungsfaecher: ['f1', 'f2', 'f5'] },
	{ id: 'm2', vorname: 'S.', nachname: 'Bauer', pruefungsfaecher: ['f1', 'f3'] },
	{ id: 'm3', vorname: 'T.', nachname: 'Koch', pruefungsfaecher: ['f4', 'f5'] },
	{ id: 'm4', vorname: 'R.', nachname: 'Lenz', pruefungsfaecher: ['f2', 'f5'] },
	{ id: 'm5', vorname: 'P.', nachname: 'Wagner', pruefungsfaecher: ['f3', 'f4'] }
];

export const mockAntritte: Antritt[] = [
	{
		id: 'a1',
		kandidatId: 'k1',
		fachId: 'f1',
		startVB: '09:00',
		beginn: '09:20',
		ende: null,
		thema1Id: null,
		thema2Id: null,
		themenwahl: null,
		prueferId: 'm2',
		beisitzId: 'm3',
		kvId: 'm1',
		aufgabeNr: null,
		pruefungsnote: null,
		jahresnote: 2
	},
	{
		id: 'a2',
		kandidatId: 'k2',
		fachId: 'f2',
		startVB: '09:30',
		beginn: null,
		ende: null,
		thema1Id: null,
		thema2Id: null,
		themenwahl: null,
		prueferId: 'm4',
		beisitzId: 'm3',
		kvId: 'm1',
		aufgabeNr: null,
		pruefungsnote: null,
		jahresnote: null
	},
	{
		id: 'a3',
		kandidatId: 'k3',
		fachId: 'f3',
		startVB: '10:00',
		beginn: null,
		ende: null,
		thema1Id: null,
		thema2Id: null,
		themenwahl: null,
		prueferId: 'm2',
		beisitzId: 'm5',
		kvId: 'm5',
		aufgabeNr: null,
		pruefungsnote: null,
		jahresnote: null
	},
	{
		id: 'a4',
		kandidatId: 'k4',
		fachId: 'f4',
		startVB: null,
		beginn: null,
		ende: null,
		thema1Id: null,
		thema2Id: null,
		themenwahl: null,
		prueferId: 'm3',
		beisitzId: 'm5',
		kvId: 'm1',
		aufgabeNr: null,
		pruefungsnote: null,
		jahresnote: null
	},
	{
		id: 'a5',
		kandidatId: 'k5',
		fachId: 'f5',
		startVB: null,
		beginn: null,
		ende: null,
		thema1Id: null,
		thema2Id: null,
		themenwahl: null,
		prueferId: 'm4',
		beisitzId: 'm1',
		kvId: 'm1',
		aufgabeNr: null,
		pruefungsnote: null,
		jahresnote: null
	}
];
