export function load({ params }: { params: { id: string } }) {
	return {
		id: params.id
	};
}

export const prerender = false;
