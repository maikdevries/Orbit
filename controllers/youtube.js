const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
	getYouTubeChannelData, getYouTubeChannelIDByUsername, getYouTubeChannelIDByCustomURL
}

async function getYouTubeChannelData (channelID) {
	return (await getFetch(`channels?part=snippet&id=${channelID}&maxResults=1`)).items?.[0]?.snippet ?? { };
}

async function getYouTubeChannelIDByUsername (username) {
	return (await getFetch(`channels?part=snippet&forUsername=${username}&maxResults=1`)).items?.[0]?.id;
}

async function getYouTubeChannelIDByCustomURL (customURL) {
	const channelIDs = (await getFetch(`search?part=snippet&q=${customURL}&type=channel&maxResults=5`)).items?.map((channel) => channel.id.channelId);
	
	const channels = (await getFetch(`channels?part=snippet&id=${channelIDs.join()}&maxResults=5`)).items;
	if (!channels?.length) return { };

	for (const channel of channels) if (channel.snippet?.customUrl?.toLowerCase() === customURL.toLowerCase()) return { channelID: channel.id, ...channel.snippet };

	return { };
}

async function getFetch (url) {
	try {
		const response = await fetch(`https://www.googleapis.com/youtube/v3/${url}&key=${process.env.YOUTUBE_KEY}`);
		return response.ok ? await response.json() : (() => { throw new Error(`Fetching YouTube API failed with status ${response.status}. URL: ${response.url}`) })();
	} catch (error) { throw error.toString() }
}
