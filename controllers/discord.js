const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { hasGuildSettings } = require('../controllers/data.js');

module.exports = {
	getData, updateGuildsData, hasGuildAccess, getGuildData, getGuildChannels, getGuildCategories, getGuildRoles, getGuildEmojis, getMessageData, getMissingPermissions
}

const requiredPermissions = [
	{ name: 'Manage Roles', bits: 0x10000000 },
	{ name: 'Manage Channels', bits: 0x10 },
	{ name: 'Create Invite', bits: 0x1 },
	{ name: 'Read Messages', bits: 0x400 },
	{ name: 'Send Messages', bits: 0x800 },
	{ name: 'Manage Messages', bits: 0x2000 },
	{ name: 'Embed Links', bits: 0x4000 },
	{ name: 'Read Message History', bits: 0x10000 },
	{ name: 'Mention @everyone, @here and All Roles', bits: 0x20000 },
	{ name: 'Add Reactions', bits: 0x40 },
	{ name: 'Use External Emojis', bits: 0x40000 }
]

async function getData (authData) {
	return {
		user: await getUser(authData.tokenType, authData.token),
		guilds: await getGuilds(authData.tokenType, authData.token),
		expires: Date.now() + 10000
	}
}

async function updateGuildsData (session) {
	const guilds = await getGuilds(session.tokenType, session.token);
	Object.assign(session, { guilds: guilds, expires: Date.now() + 10000 });

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

async function getGuildData (guildID) {
	return await getFetch(`guilds/${guildID}`, 'Bot', process.env.DISCORD_BOT_TOKEN);
}

async function getGuildMember (guildID, userID) {
	return await getFetch(`guilds/${guildID}/members/${userID}`, 'Bot', process.env.DISCORD_BOT_TOKEN);
}

async function getGuildChannels (guildID) {
	const channels = await getFetch(`guilds/${guildID}/channels`, 'Bot', process.env.DISCORD_BOT_TOKEN);
	return channels.filter((channel) => [0, 5].includes(channel.type));
}

async function getGuildCategories (guildID) {
	const channels = await getFetch(`guilds/${guildID}/channels`, 'Bot', process.env.DISCORD_BOT_TOKEN);
	return channels.filter((channel) => channel.type === 4).sort((a, b) => a.position - b.position);
}

async function getGuildRoles (guildID) {
	const roles = await getFetch(`guilds/${guildID}/roles`, 'Bot', process.env.DISCORD_BOT_TOKEN);
	const clientHighestRole = await getHighestRole(guildID, roles, process.env.DISCORD_CLIENT_ID);

	return roles.map((role) => ({
		...role,
		color: `rgb(${(role.color === 0 ? 'b9bbbe' : role.color.toString(16).padStart(6, '0')).match(/[a-f\d]{2}/g).map((x) => parseInt(x, 16)).join(', ')})`,
		manageable: role.position < clientHighestRole.position
	})).sort((a, b) => b.position - a.position);
}

async function getGuildEmojis (guildID) {
	return await getFetch(`guilds/${guildID}/emojis`, 'Bot', process.env.DISCORD_BOT_TOKEN);
}

async function getMessageData (channelID, messageID) {
	try {
		return await getFetch(`channels/${channelID}/messages/${messageID}`, 'Bot', process.env.DISCORD_BOT_TOKEN);
	} catch (error) {
		if (error instanceof FetchError && error.statusCode === 404) return { };
		else throw error.toString();
	}
}

async function getHighestRole (guildID, guildRoles, userID) {
	const highestRoleID = (await getGuildMember(guildID, userID)).roles.reduce((previous, current) => guildRoles.find((guildRole) => guildRole.id === current).position > guildRoles.find((guildRole) => guildRole.id === previous).position ? current : previous);
	return guildRoles.find((guildRole) => guildRole.id === highestRoleID);
}

async function getMissingPermissions (guildID, guildRoles, userID) {
	const clientMember = await getGuildMember(guildID, userID);
	const permissions = clientMember.roles.reduce((previous, current) => previous |= guildRoles.find((role) => role.id === current).permissions, guildRoles.find((role) => role.id === guildID).permissions);

	const missingPermissions = [];
	for (const permission of requiredPermissions) if ((permissions & permission.bits) !== permission.bits) missingPermissions.push(permission.name);

	return missingPermissions;
}

async function getFetch (url, tokenType, token) {
	try {
		const response = await fetch(`https://discord.com/api/v9/${url}`, { headers: { 'Authorization': `${tokenType} ${token}`, 'Content-Type': 'application/json' } });
		return response.ok ? await response.json() : (() => { throw new FetchError(response.status, `Fetching Discord API failed with status ${response.status}. URL: ${response.url}`) })();
	} catch (error) { throw error }
}

class FetchError extends Error {
	constructor (statusCode, message) {
		super(message);
		this._statusCode = statusCode;
	}

	get statusCode () {
		return this._statusCode;
	}

	set statusCode (statusCode) {
		this._statusCode = statusCode;
	}
}
