const { EmojiButton } = await import('https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@latest/dist/index.min.js');

const guildID = document.location.pathname.match(/[0-9]\w+/g)[0];

let emojiPicker, originalState, observer;

export async function getEmojiPicker () {
	return emojiPicker ?? await createEmojiPicker();
}

async function createEmojiPicker () {
	try {
		emojiPicker = new EmojiButton({
			zIndex: 4,
			style: 'twemoji',
			emojiSize: '24px',
			rows: 5,
			styleProperties: {
				'--font': `normal normal bold 100% 'Open Sans', sans-serif`,
				'--font-size': '90%',
				'--background-color': '#23282d',
				'--category-button-size': '16px',
				'--category-button-color': '#969696',
				'--category-button-active-color': '#f0f0f0',
				'--text-color': '#f0f0f0',
				'--secondary-text-color': '#969696',
				'--hover-color': '#36393f'
			},
			icons: {
				categories: {
					'custom': `https://cdn.discordapp.com/icons/${guildID}/${(await getAPIGuild(`guilds/${guildID}`)).icon}.png?size=16`
				}
			},
			custom: (await getAPIGuild(`guilds/${guildID}/emojis`)).map((emoji) => ({ name: emoji.name, emoji: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}?size=24` }))
		});

		return emojiPicker;
	} catch (error) { throw error.toString() }
}

export function createMutationObserver (target) {
	const saveChangesContainer = document.getElementById('saveChangesContainer');

	originalState = { ...originalState, 'mutation': target.cloneNode(true) };

	observer = new MutationObserver(() => originalState['mutation'].isEqualNode(target) ? saveChangesContainer.classList.remove('visible') : saveChangesContainer.classList.add('visible'));
	observer.observe(target, { childList: true, subtree: true });
}

export function setOriginalState (key, target) {
	return originalState = { ...originalState, [key]: target.cloneNode(true) };
}

export function getOriginalState (key) {
	return originalState[key];
}

export async function getAPIGuild (url) {
	try {
		const response = await fetch(`${document.location.origin}/api/${url}`, { method: 'GET' });
		return response.ok ? await response.json() : (() => { throw new Error(`GET API failed with status ${response.status}. URL: ${response.url}`) })();
	} catch (error) { throw error.toString() }
}

export async function postAPIGuild (url, data) {
	try {
		const response = await fetch(`${document.location.origin}/api/${guildID}/${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
		return response.ok ? await response.json() : (() => { throw new Error(`POST API failed with status ${response.status}. URL: ${response.url}`) })();
	} catch (error) { throw error.toString() }
}

export async function patchAPIGuild (url, data) {
	try {
		const response = await fetch(`${document.location.origin}/api/${guildID}/${url}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
		return response.ok ? await response.json() : (() => { throw new Error(`PATCH API failed with status ${response.status}. URL: ${response.url}`) })();
	} catch (error) { throw error.toString() }
}

export async function deleteAPIGuild (url) {
	try {
		const response = await fetch(`${document.location.origin}/api/${guildID}/${url}`, { method: 'DELETE' });
		return response.ok ? await response.json() : (() => { throw new Error(`DELETE API failed with status ${response.status}. URL: ${response.url}`) })();
	} catch (error) { throw error.toString() }
}

export function createDiscordRoleElement (roleData) {
	const roleContainerElement = document.createElement('div');
	roleContainerElement.classList.add('discordRole');
	if (roleData.dataset.manageable === 'false') roleContainerElement.classList.add('error');
	roleContainerElement.dataset.discordRole = roleData.dataset.discordRole;
	roleContainerElement.dataset.manageable = roleData.dataset.manageable;

	const roleColour = document.createElement('div');
	roleColour.classList.add('discordRoleColour');
	roleColour.style.backgroundColor = roleData.style.color;

	const roleName = document.createElement('p');
	roleName.classList.add('discordRoleName');
	roleName.textContent = roleData.textContent;

	const deleteRoleButton = document.createElement('span');
	deleteRoleButton.classList.add('deleteDiscordRole', 'material-icons');
	deleteRoleButton.setAttribute('onclick', 'deleteDiscordRole(event)');
	deleteRoleButton.textContent = 'clear';

	roleContainerElement.append(roleColour, roleName, deleteRoleButton);
	return roleContainerElement;
}

export async function createReactionRoleReactionElement (reactionData) {
	const reactionContainerElement = document.createElement('div');
	reactionContainerElement.classList.add('reactionRoleReaction');

	const deleteReactionButton = document.createElement('span');
	deleteReactionButton.classList.add('deleteReactionRoleReaction', 'material-icons');
	deleteReactionButton.setAttribute('onclick', 'deleteReactionRoleReaction(event)');
	deleteReactionButton.textContent = 'clear';

	const reactionEmoji = document.createElement('img');
	reactionEmoji.classList.add('reactionRoleEmoji');
	reactionEmoji.src = reactionData.url;
	reactionEmoji.dataset.emoji = reactionData.emoji || reactionData.url.match(/(\d{3,})/g);

	const reactionRolesContainer = document.createElement('div');
	reactionRolesContainer.classList.add('discordRolesContainer');

	const reactionRoles = document.createElement('div');
	reactionRoles.classList.add('discordRoles');

	reactionRoles.append(await createAddDiscordRoleElement());

	const errorReactionRoles = document.createElement('div');
	errorReactionRoles.classList.add('errorDiscordRoles');

	const errorIcon = document.createElement('span');
	errorIcon.classList.add('material-icons');
	errorIcon.textContent = 'error';

	const errorMessage = document.createElement('p');
	errorMessage.textContent = 'One of the selected roles cannot be used by Lunar.';

	errorReactionRoles.append(errorIcon, errorMessage);

	reactionRolesContainer.append(reactionRoles, errorReactionRoles);

	reactionContainerElement.append(deleteReactionButton, reactionEmoji, reactionRolesContainer);
	return reactionContainerElement;
}

export async function createAddDiscordRoleElement () {
	const addRoleContainerElement = document.createElement('div');
	addRoleContainerElement.classList.add('addDiscordRole');
	addRoleContainerElement.setAttribute('onclick', 'expandDiscordRoleList(event)');

	const addRoleIcon = document.createElement('span');
	addRoleIcon.classList.add('material-icons');
	addRoleIcon.textContent = 'add';

	const roleListContainer = document.createElement('ul');
	roleListContainer.classList.add('discordRoleList');

	for (const role of (await getAPIGuild(`guilds/${guildID}/roles`)).filter((role) => !role.managed && role.id !== guildID)) {
		const roleListEntry = document.createElement('li');
		roleListEntry.classList.add('discordRoleListEntry');
		roleListEntry.style.color = role.color;
		roleListEntry.dataset.discordRole = role.id;
		roleListEntry.dataset.manageable = role.manageable;
		roleListEntry.setAttribute('onclick', 'addDiscordRole(event)');

		const roleName = document.createElement('p');
		roleName.textContent = role.name;

		roleListEntry.append(roleName);

		roleListContainer.append(roleListEntry);
	}

	addRoleContainerElement.append(addRoleIcon, roleListContainer);
	return addRoleContainerElement;
}

export function createMessageElement (messageData) {
	const messageContainer = document.createElement('div');
	messageContainer.classList.add('message');

	const deleteMessageButton = document.createElement('span');
	deleteMessageButton.classList.add('deleteMessage', 'material-icons');
	deleteMessageButton.setAttribute('onclick', 'deleteMessage(event)');
	deleteMessageButton.textContent = 'clear';

	const messageContent = document.createElement('p');
	messageContent.classList.add('messageContent');
	messageContent.textContent = messageData;

	messageContainer.append(deleteMessageButton, messageContent);
	return messageContainer;
}

function createSyncChangesElement () {
	const syncChanges = document.createElement('span');
	syncChanges.classList.add('syncChanges', 'material-icons');

	return syncChanges;
}

function createDeleteElementButton (deleteFunction) {
	const deleteElementButton = document.createElement('button');
	deleteElementButton.classList.add('deleteElementButton');
	deleteElementButton.type = 'button';
	deleteElementButton.setAttribute('onclick', deleteFunction);
	deleteElementButton.textContent = 'DELETE';

	return deleteElementButton;
}

function createFormButtonsElement (cancelFunction, saveFunction) {
	const formButtonsContainer = document.createElement('div');
	formButtonsContainer.classList.add('formButtonsContainer');

	const cancelChangesButton = document.createElement('button');
	cancelChangesButton.classList.add('cancelChangesButton');
	cancelChangesButton.type = 'button';
	cancelChangesButton.setAttribute('onclick', cancelFunction);
	cancelChangesButton.textContent = 'CANCEL';

	const saveChangesButton = document.createElement('button');
	saveChangesButton.classList.add('saveChangesButton');
	saveChangesButton.type = 'button';
	saveChangesButton.setAttribute('onclick', saveFunction);
	saveChangesButton.textContent = 'SAVE';

	formButtonsContainer.append(createSyncChangesElement(), cancelChangesButton, saveChangesButton);
	return formButtonsContainer;
}

function createDiscordChannelListEntryElement (channel) {
	const listEntry = document.createElement('li');
	listEntry.classList.add('discordChannelListEntry');
	listEntry.dataset.discordChannel = channel.id;
	listEntry.setAttribute('onclick', 'changeSelectedDiscordChannel(event)');

	const channelName = document.createElement('p');
	channelName.textContent = `#${channel.name}`;

	listEntry.append(channelName);

	return listEntry;
}

async function createListDiscordChannelElement (channelData) {
	const discordChannelListContainer = document.createElement('div');
	discordChannelListContainer.classList.add('discordChannelListContainer');
	discordChannelListContainer.setAttribute('onclick', 'expandDiscordChannelList(event)');

	const discordChannelListHeader = document.createElement('div');
	discordChannelListHeader.classList.add('discordChannelListHeader');

	const discordChannelName = document.createElement('p');
	discordChannelName.classList.add('discordChannelName');
	discordChannelName.dataset.discordChannel = channelData.id;
	discordChannelName.textContent = `#${channelData.name}`;

	const expandButton = document.createElement('span');
	expandButton.classList.add('material-icons');
	expandButton.textContent = 'expand_more';

	discordChannelListHeader.append(discordChannelName, expandButton);

	const discordChannelList = document.createElement('ul');
	discordChannelList.classList.add('discordChannelList');

	const channels = await getAPIGuild(`guilds/${guildID}/channels`);
	for (const channel of channels.filter((guildChannel) => !guildChannel.parent_id)) discordChannelList.append(createDiscordChannelListEntryElement(channel));

	for (const category of await getAPIGuild(`guilds/${guildID}/categories`)) {
		const listCategory = document.createElement('div');
		listCategory.classList.add('discordChannelListCategory');

		const categoryName = document.createElement('p');
		categoryName.classList.add('discordChannelListCategoryName');
		categoryName.textContent = category.name;

		const categoryList = document.createElement('ul');

		for (const channel of channels.filter((guildChannel) => category.id === guildChannel.parent_id)) categoryList.append(createDiscordChannelListEntryElement(channel));

		listCategory.append(categoryName, categoryList);

		discordChannelList.append(listCategory);
	}

	discordChannelListContainer.append(discordChannelListHeader, discordChannelList);
	return discordChannelListContainer;
}

export function createReactionRoleElement (channelName, messageData) {
	const reactionRoleContainer = document.createElement('div');
	reactionRoleContainer.classList.add('reactionRole');
	reactionRoleContainer.dataset.id = messageData.id;
	reactionRoleContainer.dataset.discordChannel = messageData.channel_id;
	reactionRoleContainer.setAttribute('onclick', `expandSettings(event, '.reactionRoleSettings')`);

	const reactionRoleHeader = document.createElement('div');
	reactionRoleHeader.classList.add('reactionRoleHeader');

	const reactionRoleData = document.createElement('div');
	reactionRoleData.classList.add('reactionRoleData');

	const discordChannelName = document.createElement('p');
	discordChannelName.classList.add('reactionRoleChannelName');
	discordChannelName.textContent = channelName;

	const reactionRoleMessage = document.createElement('p');
	reactionRoleMessage.classList.add('reactionRoleMessage');
	reactionRoleMessage.textContent = messageData.content;

	reactionRoleData.append(discordChannelName, reactionRoleMessage);

	const reactionRoleHeaderSideContainer = document.createElement('div');
	reactionRoleHeaderSideContainer.classList.add('reactionRoleHeaderSideContainer');

	reactionRoleHeaderSideContainer.append(createSyncChangesElement(), createDeleteElementButton('deleteReactionRole(event)'));

	reactionRoleHeader.append(reactionRoleData, reactionRoleHeaderSideContainer);

	const reactionRoleSettings = document.createElement('div');
	reactionRoleSettings.classList.add('reactionRoleSettings');

	const settingsHeader = document.createElement('p');
	settingsHeader.classList.add('reactionRoleSettingsHeader');
	settingsHeader.textContent = 'Reactions';

	const reactionsContainer = document.createElement('div');
	reactionsContainer.classList.add('reactionRoleSettingsContainer');

	const settingsFooter = document.createElement('div');
	settingsFooter.classList.add('reactionRoleSettingsContainerFooter');

	const addReactionButton = document.createElement('div');
	addReactionButton.classList.add('addReactionRoleReaction');
	addReactionButton.setAttribute('onclick', 'addReactionRoleReaction(event)');

	const addReactionIcon = document.createElement('span');
	addReactionIcon.classList.add('material-icons');
	addReactionIcon.textContent = 'add_reaction';

	addReactionButton.append(addReactionIcon);

	settingsFooter.append(addReactionButton, createFormButtonsElement('cancelReactionRoleChanges(event)', 'saveReactionRoleChanges(event)'));

	reactionsContainer.append(settingsFooter);

	reactionRoleSettings.append(settingsHeader, reactionsContainer);

	reactionRoleContainer.append(reactionRoleHeader, reactionRoleSettings);
	return reactionRoleContainer;
}

export async function createSubscribedChannelElement (discordChannelData, channelData) {
	const subscribedChannel = document.createElement('div');
	subscribedChannel.classList.add('subscribedChannel');
	subscribedChannel.dataset.id = (channelData.login || channelData.channelID);
	subscribedChannel.setAttribute('onclick', `expandSettings(event, '.subscribedChannelSettings')`);

	const subscribedChannelHeader = document.createElement('div');
	subscribedChannelHeader.classList.add('subscribedChannelHeader');

	const subscribedChannelData = document.createElement('div');
	subscribedChannelData.classList.add('subscribedChannelData');

	const subscribedChannelImage = document.createElement('img');
	subscribedChannelImage.classList.add('subscribedChannelImage');
	subscribedChannelImage.src = (channelData.profile_image_url || channelData.thumbnails.default.url);

	const subscribedChannelName = document.createElement('p');
	subscribedChannelName.classList.add('subscribedChannelName');
	subscribedChannelName.textContent = (channelData.display_name || channelData.title);

	subscribedChannelData.append(subscribedChannelImage, subscribedChannelName);

	const subscribedChannelHeaderSideContainer = document.createElement('div');
	subscribedChannelHeaderSideContainer.classList.add('subscribedChannelHeaderSideContainer');

	const headerDiscordChannelName = document.createElement('p');
	headerDiscordChannelName.classList.add('headerDiscordChannelName');
	headerDiscordChannelName.textContent = `#${discordChannelData.name}`;

	subscribedChannelHeaderSideContainer.append(headerDiscordChannelName, createSyncChangesElement(), createDeleteElementButton('deleteSubscribedChannel(event)'));

	subscribedChannelHeader.append(subscribedChannelData, subscribedChannelHeaderSideContainer);

	const subscribedChannelSettings = document.createElement('div');
	subscribedChannelSettings.classList.add('subscribedChannelSettings');

	const subscribedChannelSettingsContainer = document.createElement('div');
	subscribedChannelSettingsContainer.classList.add('subscribedChannelSettingsContainer');

	const messageContainer = document.createElement('div');
	messageContainer.classList.add('subscribedChannelMessageContainer');

	const messageSettingsHeader = document.createElement('p');
	messageSettingsHeader.classList.add('subscribedChannelSettingsHeader');
	messageSettingsHeader.textContent = 'Message';

	const messageInput = document.createElement('textarea');
	messageInput.classList.add('subscribedChannelMessage');
	messageInput.maxLength = 2000;
	messageInput.placeholder = 'An optional message attached to each announcement.';

	messageContainer.append(messageSettingsHeader, messageInput);

	const settingsSideContainer = document.createElement('div');
	settingsSideContainer.classList.add('subscribedChannelSettingsSideContainer');

	const settingsDiscordChannelContainer = document.createElement('div');

	const discordChannelSettingsHeader = document.createElement('p');
	discordChannelSettingsHeader.classList.add('subscribedChannelSettingsHeader');
	discordChannelSettingsHeader.textContent = 'Discord channel';

	settingsDiscordChannelContainer.append(discordChannelSettingsHeader, await createListDiscordChannelElement(discordChannelData));

	settingsSideContainer.append(settingsDiscordChannelContainer, createFormButtonsElement('cancelSubscribedChannelChanges(event)', 'saveSubscribedChannelChanges(event)'));

	subscribedChannelSettingsContainer.append(messageContainer, settingsSideContainer);

	subscribedChannelSettings.append(subscribedChannelSettingsContainer);

	subscribedChannel.append(subscribedChannelHeader, subscribedChannelSettings);
	return subscribedChannel;
}
