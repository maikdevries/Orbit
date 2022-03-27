const { EmojiButton } = await import('https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button@latest/dist/index.min.js');

const guildID = document.location.pathname.match(/[0-9]\w+/g)[0];

let emojiPicker;

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
			'--font': "normal normal bold 100% 'Open Sans', sans-serif",
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

export async function fetchAPI (url) {
	try {
		const response = await fetch(`${document.location.origin}/orbit/api/${url}`);
		return await response.json();
	} catch (error) { console.log(error) }
}

export function createDiscordRoleElement (roleData) {
	const roleContainerElement = document.createElement('div');
	roleContainerElement.classList.add('discordRole');

	const roleColour = document.createElement('div');
	roleColour.classList.add('discordRoleColour');
	roleColour.style.background = `${roleData.style.color}`;

	const roleName = document.createElement('p');
	roleName.classList.add('discordRoleName');
	roleName.textContent = roleData.textContent;

	const deleteRoleButton = document.createElement('span');
	deleteRoleButton.classList.add('deleteDiscordRole', 'material-icons');

	deleteRoleButton.onclick = deleteDiscordRole;
	deleteRoleButton.textContent = 'clear';

	roleContainerElement.append(roleColour, roleName, deleteRoleButton);
	return roleContainerElement;
}

export async function createReactionRoleReactionElement (reactionData) {
	const reactionContainerElement = document.createElement('div');
	reactionContainerElement.classList.add('reactionRoleReaction');

	const deleteReactionButton = document.createElement('span');
	deleteReactionButton.classList.add('deleteReactionRoleReaction', 'material-icons');
	deleteReactionButton.onclick = deleteReactionRoleReaction;
	deleteReactionButton.textContent = 'clear';

	const reactionEmoji = document.createElement('img');
	reactionEmoji.classList.add('reactionRoleEmoji');
	reactionEmoji.src = reactionData.url;

	const reactionRoles = document.createElement('div');
	reactionRoles.classList.add('reactionRoleRoles');
	reactionRoles.append(await createAddDiscordRoleElement());

	reactionContainerElement.append(deleteReactionButton, reactionEmoji, reactionRoles);
	return reactionContainerElement;
}

async function createAddDiscordRoleElement () {
	const addRoleContainerElement = document.createElement('div');
	addRoleContainerElement.classList.add('addDiscordRole');
	addRoleContainerElement.onclick = expandDiscordRoleList;

	const addRoleIcon = document.createElement('span');
	addRoleIcon.classList.add('material-icons');
	addRoleIcon.textContent = 'add';

	const roleListContainer = document.createElement('ul');
	roleListContainer.classList.add('discordRoleList');

	for (const role of await fetchAPI(`guilds/${guildID}/roles`)) {
		const roleListEntry = document.createElement('li');
		roleListEntry.classList.add('discordRoleListEntry');
		roleListEntry.style.color = role.color;
		roleListEntry.onclick = addDiscordRole;

		const roleName = document.createElement('p');
		roleName.textContent = role.name;

		roleListEntry.append(roleName);
		roleListContainer.append(roleListEntry);
	}

	addRoleContainerElement.append(addRoleIcon, roleListContainer);
	return addRoleContainerElement;
}
