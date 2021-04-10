const authData = { tokenType: localStorage.getItem('tokenType'), accessToken: localStorage.getItem('accessToken') };

async function getDiscordUser () {
	return await fetchRequest(`discord/getUser`, authData);
}

async function getDiscordGuilds () {
	return await fetchRequest(`discord/getGuilds`, authData);
}

async function getGuildSettings (guildID) {
	const data = { "guildID": guildID }
	return await fetchRequest(`data/getGuild`, data);
}

async function fetchRequest (url, data) {
	try {
		const res = await fetch(`https://maikdevries.com/orbit/api/${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },  body: JSON.stringify(data) });
		return await res.json();
	} catch (error) { console.error(error) }
}
