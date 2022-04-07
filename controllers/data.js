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
	hasGuildSettings, getGuildSettings, updateGuildSetting, deleteGuildSetting
}

async function hasGuildSettings (guildID) {
	return await db.has(guildID);
}

async function getGuildSettings (path) {
	return await db.get(path);
}

async function updateGuildSetting (path, data, channelUsername = null) {
	const currentSettings = await db.get(path);
	await db.set(path, (channelUsername ? currentSettings.map((channel) => (channel.username === channelUsername ? { ...channel, ...data } : channel)) : { ...currentSettings, ...data }));

	return await db.get(path);
}

async function deleteGuildSetting (path, channelUsername = null) {
	channelUsername ? await db.remove(path, (channel) => channel.username === channelUsername) : await db.delete(path);

	return await db.get(path);
}
