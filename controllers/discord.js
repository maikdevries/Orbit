const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { hasGuildSettings } = require('../controllers/data.js');

module.exports = {
	getData, updateGuildsData, hasGuildAccess, getGuildData, getGuildChannels, getGuildCategories, getGuildRoles, getGuildEmojis, getMessageData
}

async function getData (authData) {
	return {
		user: await getUser(authData.tokenType, authData.token),
		guilds: await getGuilds(authData.tokenType, authData.token),
		expires: Date.now() + 5000
	}
}

async function updateGuildsData (session) {
	const guilds = await getGuilds(session.tokenType, session.token);
	Object.assign(session, { guilds: guilds, expires: Date.now() + 5000 });

	return guilds;
}

function hasGuildAccess (guildID, guilds) {
	const guild = guilds.find((guild) => guild.id === guildID);
	return guild.owner || (guild.permissions & 0x20) === 0x20 || (guild.permissions & 0x8) === 0x8;
}

async function getUser (tokenType, token) {
	return await getFetch('users/@me', tokenType, token);
}

async function getGuilds (tokenType, token) {
	const guilds = await getFetch('users/@me/guilds', tokenType, token);
	return await Promise.all(guilds.filter((guild) => guild.owner || (guild.permissions & 0x20) === 0x20 || (guild.permissions & 0x8) === 0x8).map(async (guild) => ({ ...guild, joined: await hasGuildSettings(guild.id) })));
}

async function getGuildData (guildID, tokenType, token) {
	return await getFetch(`guilds/${guildID}`, tokenType, token);
}

async function getGuildChannels (guildID, tokenType, token) {
	const channels = await getFetch(`guilds/${guildID}/channels`, tokenType, token);
	return channels.filter((channel) => [0, 5].includes(channel.type));
}

async function getGuildCategories (guildID, tokenType, token) {
	const channels = await getFetch(`guilds/${guildID}/channels`, tokenType, token);
	return channels.filter((channel) => channel.type === 4).sort((a, b) => a.position - b.position);
}

async function getGuildRoles (guildID, tokenType, token) {
	const roles = await getFetch(`guilds/${guildID}/roles`, tokenType, token);
	return roles.filter((role) => !role.managed).map((role) => ({ ...role, color: `#${role.color === 0 ? 'B9BBBE' : role.color.toString(16).padStart(6, '0')}` })).sort((a, b) => b.position - a.position);
}

async function getGuildEmojis (guildID, tokenType, token) {
	return await getFetch(`guilds/${guildID}/emojis`, tokenType, token);
}

async function getMessageData (channelID, messageID, tokenType, token) {
	return await getFetch(`channels/${channelID}/messages/${messageID}`, tokenType, token);
}

async function getFetch (url, tokenType, token) {
	try {
		const response = await fetch(`https://discord.com/api/${url}`, { headers: { 'Authorization': `${tokenType} ${token}`, 'Content-Type': 'application/json' } });
		return await response.json();
	} catch (error) { console.error(error) }
}
