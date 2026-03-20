import { json } from '@sveltejs/kit';
import { RANDOM_API_KEY } from '$env/static/private';
import Pocketbase from 'pocketbase';

export function GET() {
	return json([
		{
			vorname: 'markus',
			nachname: 'seiwald'
		}
	]);
}

export async function POST({ request }) {
	const data = await request.json();

	console.log('request: ', request);
	console.log('data: ', data);

	let res = await fetch('https://api.random.org/json-rpc/4/invoke', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			jsonrpc: '2.0',
			method: 'generateIntegers',
			params: {
				apiKey: RANDOM_API_KEY,
				n: 2,
				min: 1,
				max: data.topicCount,
				replacement: false,
				base: 10
			},
			id: Math.ceil(Math.random() * 1000)
		})
	});
	let randomAPI = await res.json();
	// console.log('Zufallszahlenarray: ', randomAPI.result.random.data);

	return json(randomAPI.result.random.data);
}
