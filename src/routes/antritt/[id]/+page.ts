import mockData from '$lib/data/mock.json';
import { error } from '@sveltejs/kit';

export function load({ params }: { params: { id: string } }) {
	const antrittId = parseInt(params.id);
	const antritt = mockData.antritte.find(a => a.id === antrittId);
	
	if (!antritt) {
		throw error(404, 'Antritt nicht gefunden');
	}
	
	const kandidat = mockData.kandidaten.find(k => k.id === antritt.kandidatId);
	const fach = mockData.faecher.find(f => f.id === antritt.fachId);
	const pruefer = mockData.kommissionsmitglieder.find(k => k.id === antritt.prueferId);
	const beisitz = mockData.kommissionsmitglieder.find(k => k.id === antritt.beisitzId);
	const kv = mockData.kommissionsmitglieder.find(k => k.id === antritt.kvId);
	
	// Get available topics for this subject
	const themengebiete = mockData.themengebiete.filter(t => t.fachId === antritt.fachId);
	
	// Get drawn topics if they exist
	const thema1 = antritt.thema1Id ? mockData.themengebiete.find(t => t.id === antritt.thema1Id) : null;
	const thema2 = antritt.thema2Id ? mockData.themengebiete.find(t => t.id === antritt.thema2Id) : null;
	
	return {
		antritt,
		kandidat,
		fach,
		pruefer,
		beisitz,
		kv,
		themengebiete,
		thema1,
		thema2,
		allKommissionsmitglieder: mockData.kommissionsmitglieder
	};
}
