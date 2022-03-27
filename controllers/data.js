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
	hasGuildSettings, getGuildSettings
}

async function hasGuildSettings (guildID) {
	return await db.has(guildID);
}

async function getGuildSettings (path) {
	return await db.get(path);
}
