const { EmojiButton } = await import('https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@latest/dist/index.min.js');

const guildID = document.location.pathname.match(/[0-9]\w+/g)[0];

let emojiPicker, originalState, observer;

export async function getEmojiPicker () {
	return emojiPicker ?? await createEmojiPicker();
}

async function createEmojiPicker () {
	emojiPicker = new EmojiButton({
		zIndex: 1,
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
				'custom': `https://cdn.discordapp.com/icons/${guildID}/${(await fetchAPI(`guilds/${guildID}`)).icon}.png?size=16`
			}
		},
		custom: (await fetchAPI(`guilds/${guildID}/emojis`)).map((emoji) => ({ name: emoji.name, emoji: `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}?size=24` }))
	});

	return emojiPicker;
}

export function createMutationObserver (target) {
	const saveChanges = document.getElementById('saveChanges');

	originalState = { ...originalState, 'mutation': target.cloneNode(true) };

	observer = new MutationObserver(() => originalState['mutation'].isEqualNode(target) ? saveChanges.classList.remove('visible') : saveChanges.classList.add('visible'));
	observer.observe(target, { childList: true, subtree: true });
}

export function setOriginalState (key, target) {
	return originalState = { ...originalState, [key]: target.cloneNode(true) };
}

export function getOriginalState (key) {
	return originalState[key];
}

export async function fetchAPI (url) {
	try {
		const response = await fetch(`${document.location.origin}/orbit/api/${url}`);
		return await response.json();
	} catch (error) { console.error(error) }
}

export async function postAPIGuild (url, data) {
	try {
		const response = await fetch(`${document.location.origin}/orbit/api/${guildID}/${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
		return await response.json();
	} catch (error) { console.error(error) }
}

export async function deleteAPIGuild (url) {
	try {
		const response = await fetch(`${document.location.origin}/orbit/api/${guildID}/${url}`, { method: 'DELETE' });
		return await response.json();
	} catch (error) { console.error(error) }
}

export function createDiscordRoleElement (roleData) {
	const roleContainerElement = document.createElement('div');
	roleContainerElement.classList.add('discordRole');
	roleContainerElement.dataset.discordRole = roleData.dataset.discordRole;

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

	const reactionRoles = document.createElement('div');
	reactionRoles.classList.add('discordRoles');
	reactionRoles.append(await createAddDiscordRoleElement());

	reactionContainerElement.append(deleteReactionButton, reactionEmoji, reactionRoles);
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

	for (const role of await fetchAPI(`guilds/${guildID}/roles`)) {
		const roleListEntry = document.createElement('li');
		roleListEntry.classList.add('discordRoleListEntry');
		roleListEntry.style.color = role.color;
		roleListEntry.dataset.discordRole = role.id;
		roleListEntry.setAttribute('onclick', 'addDiscordRole(event)');
		roleListEntry.textContent = role.name;

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
