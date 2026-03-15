export interface Kandidat {
	id: number | string;
	vorname: string;
	nachname: string;
	klasse: string;
}

export interface Fach {
	id: number | string;
	bezeichnung: string;
	kurzform: string;
}

export interface Themengebiet {
	id: number | string;
	bezeichnung: string;
	fachId: number | string;
}

export interface Kommissionsmitglied {
	id: number | string;
	vorname: string;
	nachname: string;
	pruefungsfaecher: (number | string)[]; // List of Fach IDs
}

export type ExamState = 'waiting' | 'prep' | 'exam' | 'done';

export interface Antritt {
	id: number | string;
	kandidatId: number | string;
	fachId: number | string;
	startVB: string | null; // e.g. "09:00"
	beginn: string | null;
	ende: string | null;
	thema1Id: number | string | null;
	thema2Id: number | string | null;
	themenwahl?: number | string | null;
	prueferId: number | string | null;
	beisitzId: number | string | null;
	kvId: number | string | null;
	aufgabeNr?: number | null;
	pruefungsnote: 1 | 2 | 3 | 4 | 5 | null;
	jahresnote: number | null;
}
