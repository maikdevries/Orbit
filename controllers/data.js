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
	hasGuildSettings, getGuildSettings, createGuildSetting, updateGuildSetting, deleteGuildSetting
}

async function hasGuildSettings (guildID) {
	try { return await db.has(guildID) }
	catch (error) { throw new Error(`Checking Josh failed for guild ID ${guildID}. Error: ${error.toString()}`) }
}

async function getGuildSettings (path) {
	try { return await db.get(path) }
	catch (error) { throw new Error(`Getting Josh failed for path ${path}. Error: ${error.toString()}`) }
}

async function createGuildSetting (path, data) {
	try {
		const currentSettings = await db.get(path);
		Array.isArray(currentSettings) ? await db.push(path, data) : await db.set(path, { ...currentSettings, ...data });

		return await db.get(path);
	} catch (error) { throw new Error(`Creating Josh failed for path ${path}. Error: ${error.toString()}`) }
}

async function updateGuildSetting (path, data, channelUsername = null) {
	try {
		const currentSettings = await db.get(path);
		await db.set(path, (channelUsername ? currentSettings.map((channel) => (channel.username === channelUsername ? { ...channel, ...data } : channel)) : { ...currentSettings, ...data }));

		return await db.get(path);
	} catch (error) { throw new Error(`Updating Josh failed for path ${path} and channelUsername was ${channelUsername}. Error: ${error.toString()}`) }
}

async function deleteGuildSetting (path, channelUsername = null) {
	try {
		channelUsername ? await db.remove(path, (channel) => channel.username === channelUsername) : await db.delete(path);

		return await db.get(path);
	} catch (error) { throw new Error(`Deleting Josh failed for path ${path} and channelUsername was ${channelUsername}. Error: ${error.toString()}`) }
}
