async function getUser () {
	try {
		const res = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `${localStorage.getItem('tokenType')} ${localStorage.getItem('accessToken')}` } });
		return await res.json();
	} catch (error) { console.error(error) }
}

async function getFilteredGuilds () {
	return filterGuilds(await getGuilds());
}

async function getGuilds () {
	try {
		const res = await fetch(`https://discord.com/api/users/@me/guilds`, { headers: { Authorization: `${localStorage.getItem('tokenType')} ${localStorage.getItem('accessToken')}` } });
		return await res.json();
	} catch (error) { console.error(error) }
}

function filterGuilds (guilds) {
	return guilds.filter((guild) => guild.owner || (guild.permissions & 0x20) === 0x20 || (guild.permissions & 0x8) === 0x8);
}
