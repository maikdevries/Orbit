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
	getGuildSettings, saveSetting
}

async function getGuildSettings (guildID) {
	return await db.get(guildID);
}

async function saveSetting (guildID, setting, data) {
	await db.update(`${guildID}.${setting}`, data);
	return await db.get(`${guildID}.${setting}`);
}
