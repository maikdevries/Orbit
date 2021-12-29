const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { hasGuildSettings } = require('../controllers/data.js');

module.exports = {
	getUser, hasGuildAccess, getGuilds, getGuildChannels, getGuildRoles
}

async function getUser (tokenType, token) {
	return await getFetch('users/@me', tokenType, token);
}

async function hasGuildAccess (guildID, tokenType, token) {
	return (await getFetch('users/@me/guilds', tokenType, token)).filter((guild) => guild.owner || (guild.permissions & 0x20) === 0x20 || (guild.permissions & 0x8) === 0x8).some((guild) => guild.id === guildID);
}

async function getGuilds (tokenType, token) {
	const guilds = (await getFetch('users/@me/guilds', tokenType, token)).filter((guild) => guild.owner || (guild.permissions & 0x20) === 0x20 || (guild.permissions & 0x8) === 0x8);
	return await Promise.all(guilds.map(async (guild) => ({ ...guild, joined: await hasGuildSettings(guild.id) })));
}

async function getGuildChannels (guildID, tokenType, token) {
	const channels = await getFetch(`guilds/${guildID}/channels`, tokenType, token);
	return channels.filter((channel) => channel.type === 0);
}

async function getGuildRoles (guildID, tokenType, token) {
	return await getFetch(`guilds/${guildID}/roles`, tokenType, token);
}

async function getFetch (url, tokenType, token) {
	try {
		const response = await fetch(`https://discord.com/api/${url}`, { headers: { Authorization: `${tokenType} ${token}`, 'Content-Type': 'application/json' } });
		return await response.json();
	} catch (error) { console.error(error) }
}
