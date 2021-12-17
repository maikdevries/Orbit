const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
	getUser, getGuilds
}

async function getUser (tokenType, token) {
	return await getFetch('users/@me', tokenType, token);
}

async function getGuilds (tokenType, token) {
	const guilds = await getFetch('users/@me/guilds', tokenType, token);
	return guilds.filter((guild) => guild.owner || (guild.permissions & 0x20) === 0x20 || (guild.permissions & 0x8) === 0x8);
}

async function getFetch (url, tokenType, token) {
	try {
		const response = await fetch(`https://discord.com/api/${url}`, { headers: { Authorization: `${tokenType} ${token}`, 'Content-Type': 'application/json' } });
		return await response.json();
	} catch (error) { console.error(error) }
}
