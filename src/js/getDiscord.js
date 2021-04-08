async function getUser () {
	return await fetchRequest(`https://maikdevries.com/orbit/api/discord/getUser`);
}

async function getGuilds () {
	return await fetchRequest(`https://maikdevries.com/orbit/api/discord/getGuilds`);
}

async function fetchRequest (url) {
	try {
		const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' },  body: JSON.stringify({ tokenType: localStorage.getItem('tokenType'), accessToken: localStorage.getItem('accessToken') }) });
		return await res.json();
	} catch (error) { console.error(error) }
}
