const Josh = require('@joshdb/core');
const provider = require('@joshdb/mongo');

const db = new Josh({
	name: 'settings',
	provider,
	providerOptions: {
		collection: 'settings',
		dbName: process.env.DATABASE_NAME,
		url: `mongodb+srv://${process.env.DATABASE_URL + process.env.DATABASE_NAME}?retryWrites=true&w=majority`
	}
});

module.exports = {
	hasGuildSettings, getGuildSettings, updateSetting, saveSetting
}

async function hasGuildSettings (guildID) {
	return await db.has(guildID);
}

async function getGuildSettings (guildID) {
	return await db.get(guildID);
}

async function updateSetting (guildID, setting, data) {
	await db.update(`${guildID}.${setting}`, data);
	return await db.get(`${guildID}.${setting}`);
}

async function saveSetting (guildID, setting, data) {
	if ((!Array.isArray(data) || !Array.isArray(await db.get(`${guildID}.${setting}`))) && (typeof data !== 'object' || typeof await db.get(`${guildID}.${setting}`) !== 'object')) return { 'error': 'Cannot use this endpoint for anything other than Array or Object types.' };

	await db.set(`${guildID}.${setting}`, data);
	return await db.get(`${guildID}.${setting}`);
}
