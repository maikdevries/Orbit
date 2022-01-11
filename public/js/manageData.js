let settingTypes;
(async () => settingTypes = await (await fetch('/resources/settingTypes.json')).json())();

function displaySettingData (featurePath) {
	document.getElementById('settingData').dataset.feature = featurePath;

	const settingListElement = document.getElementById('settingList');
	settingListElement.replaceChildren();
	settingListElement.append(...wrapListEntryElements(...generateSettingElements(featurePath)), createSaveButtonElement());

	return document.location.hash = featurePath;
}

function wrapListEntryElements (...elements) {
	const data = [];
	for (const element of elements) {
		const listEntryElement = document.createElement('li');
		listEntryElement.classList.add('settingEntry');
		listEntryElement.append(element);

		data.push(listEntryElement);
	}

	return data;
}

function generateSettingElements (featurePath) {
	const elements = [];
	for (const setting in getProperty(guildSettings, featurePath)) {
		const settingType = determineSettingType(`${featurePath}.${setting}`);

		if (settingType === 'hidden') continue;
		if (settingType === 'Object') generateSettingElements(`${featurePath}.${setting}`);

		elements.push(determineElementType(settingType, featurePath, setting));
	}

	return elements;
}

function determineSettingType (featurePath) {
	const settingType = getProperty(settingTypes, featurePath);
	return (typeof settingType === 'object') ? 'Object' : settingType;
}

function determineElementType (settingType, featurePath, setting) {
	switch (settingType) {
		case 'boolean': return createCheckBoxElement(featurePath, setting);
		case 'Role': return createSelectElement(roles, featurePath, setting);
		case 'Channel': return createSelectElement(channels, featurePath, setting);
		case 'string': return createTextBoxElement(featurePath, setting);
		case 'Object': return createObjectElement(featurePath, setting);
		case 'stringArray': return createListElement(getProperty(guildSettings, `${featurePath}.${setting}`), featurePath, setting);
		case 'TwitchUsername': return createTextBoxElement(featurePath, setting);
		case 'YouTubeUsername': return createTextBoxElement(featurePath, setting);
		case 'ReactionRoleMessages': return createReactionRoleMessages(featurePath, setting);
	}
}

async function updateSettingData () {
	const featurePath = document.getElementById('settingData').dataset.feature;

	const data = {};
	for (const setting in getProperty(guildSettings, featurePath)) {
		const settingType = determineSettingType(`${featurePath}.${setting}`);

		if (settingType === 'Object' || settingType === 'hidden') continue;

		const settingData = extractSettingData(settingType, document.getElementById(setting));
		Array.isArray(settingData) || typeof settingData === 'object' ? await saveSettingData(`${featurePath}.${setting}`, settingData) : data[setting] = settingData;
	}

	const response = await postFetch(`${window.location.href.split('#')[0]}/${featurePath}/update`, data);
	setProperty(guildSettings, featurePath, response);

	return displaySettingData(featurePath);
}

async function saveSettingData (featurePath, data) {
	return await postFetch(`${window.location.href.split('#')[0]}/${featurePath}/save`, data);
}

function extractSettingData (settingType, element) {
	switch (settingType) {
		case 'boolean': return element.checked;
		case 'Role': return element.value;
		case 'Channel': return element.value;
		case 'string': return element.value;
		case 'stringArray': return extractListEntries(element);
		case 'TwitchUsername': return element.value;
		case 'YouTubeUsername': return element.value;
		case 'ReactionRoleMessages': return extractReactionRole(element);
	}
}

function extractReactionRole (element) {
	const messages = {};
	for (const message of element.children) {
		if (message.id === 'addReactionMessageListEntryButton') continue;

		const reactions = {};
		for (const reaction of message.children) {
			if (reaction.tagName === 'BUTTON') continue;

			const roles = [];
			for (const role of reaction.children) {
				if (role.tagName === 'BUTTON' || !role.dataset.value) continue;

				roles.push(role.dataset.value);
			}

			if (roles.length) reactions[reaction.id] = roles;
		}

		messages[message.id] = reactions;
	}

	return messages;
}

function extractListEntries (element) {
	const entries = [];
	for (const entry of element.children) if (entry.id !== 'addListEntryButton') entries.push(entry.dataset.value);

	return entries;
}

function createSaveButtonElement () {
	const buttonElement = document.createElement('button');
	buttonElement.type = 'button';
	buttonElement.id = 'save';
	buttonElement.textContent = 'Save';
	buttonElement.addEventListener('click', () => updateSettingData());

	return createLabelElement('', buttonElement);
}

function createCheckBoxElement (featurePath, setting) {
	const checkboxElement = document.createElement('input');
	checkboxElement.type = 'checkbox';
	checkboxElement.id = setting;
	checkboxElement.checked = getProperty(guildSettings, `${featurePath}.${setting}`);

	return createLabelElement(setting, checkboxElement);
}

function createSelectElement (allData, featurePath, setting) {
	const options = [];
	for (const data of allData) options.push(new Option(data.name, data.id));

	const selectElement = document.createElement('select');
	selectElement.id = setting;
	selectElement.append(...options);

	const currentOptionIndex = options.findIndex((option) => option.value === getProperty(guildSettings, `${featurePath}.${setting}`));
	selectElement.options[currentOptionIndex < 0 ? 0 : currentOptionIndex].selected = true;

	return createLabelElement(setting, selectElement);
}

function createTextBoxElement (featurePath, setting) {
	const textBoxElement = document.createElement('input');
	textBoxElement.type = 'text';
	textBoxElement.id = setting;
	textBoxElement.value = getProperty(guildSettings, `${featurePath}.${setting}`);

	return createLabelElement(setting, textBoxElement);
}

function createObjectElement (featurePath, setting) {
	const buttonElement = document.createElement('button');
	buttonElement.type = 'button';
	buttonElement.id = featurePath;
	buttonElement.textContent = translateJSON(setting);
	buttonElement.setAttribute('onclick', `displaySettingData('${featurePath}.${setting}')`);

	return buttonElement;
}

function createReactionRoleMessages (featurePath, setting) {
	const messageEntries = [];
	for (const message in getProperty(guildSettings, `${featurePath}.${setting}`)) {
		const reactionEntries = [];
		for (const reaction in getProperty(guildSettings, `${featurePath}.${setting}.${message}`)) {
			const roleEntries = [];
			for (const role of getProperty(guildSettings, `${featurePath}.${setting}.${message}.${reaction}`)) roleEntries.push(createRoleListEntryElement(role));

			const listElement = document.createElement('ul');
			listElement.id = reaction;
			listElement.classList.add('reactionRoleRoles');
			listElement.textContent = reaction;
			listElement.append(createDeleteListEntryButtonElement(), ...roleEntries, createAddRoleListEntryButtonElement());

			reactionEntries.push(listElement);
		}

		const listElement = document.createElement('ul');
		listElement.id = message;
		listElement.textContent = message;
		listElement.append(createDeleteListEntryButtonElement(), ...reactionEntries, createAddReactionListEntryButtonElement());

		messageEntries.push(listElement);
	}

	const listElement = document.createElement('ul');
	listElement.id = setting;
	listElement.textContent = translateJSON(setting);
	listElement.append(createAddReactionMessageListEntryButtonElement(), ...messageEntries);

	return listElement;
}

function createAddReactionMessageListEntryButtonElement () {
	const addReactionMessageListEntryButton = document.createElement('ul');
	addReactionMessageListEntryButton.id = 'addReactionMessageListEntryButton';
	addReactionMessageListEntryButton.classList.add('addReactionRoleButton');
	addReactionMessageListEntryButton.textContent = '+ New Reaction Role';
	addReactionMessageListEntryButton.addEventListener('click', () => { addReactionMessageListEntryButton.textContent = ''; addReactionMessageListEntryButton.contentEditable = true; addReactionMessageListEntryButton.focus() });
	addReactionMessageListEntryButton.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			const messageEntryElement = document.createElement('ul');
			messageEntryElement.id = addReactionMessageListEntryButton.textContent;
			messageEntryElement.textContent = addReactionMessageListEntryButton.textContent;
			messageEntryElement.append(createDeleteListEntryButtonElement(), createAddReactionListEntryButtonElement());

			addReactionMessageListEntryButton.parentElement.append(messageEntryElement);
			addReactionMessageListEntryButton.textContent = '+ New Reaction Role';
			addReactionMessageListEntryButton.contentEditable = false;
		}
	});

	return addReactionMessageListEntryButton;
}

function createAddReactionListEntryButtonElement () {
	const addReactionListEntryButton = document.createElement('ul');
	addReactionListEntryButton.id = 'addReactionListEntryButton';
	addReactionListEntryButton.classList.add('addReactionRoleButton');
	addReactionListEntryButton.textContent = '+ New Reaction';
	addReactionListEntryButton.addEventListener('click', () => { addReactionListEntryButton.textContent = ''; addReactionListEntryButton.contentEditable = true; addReactionListEntryButton.focus() });
	addReactionListEntryButton.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			const reactionEntryElement = document.createElement('ul');
			reactionEntryElement.id = addReactionListEntryButton.textContent;
			reactionEntryElement.classList.add('reactionRoleRoles');
			reactionEntryElement.textContent = addReactionListEntryButton.textContent;
			reactionEntryElement.append(createDeleteListEntryButtonElement(), createAddRoleListEntryButtonElement());

			addReactionListEntryButton.parentElement.insertBefore(reactionEntryElement, addReactionListEntryButton);
			addReactionListEntryButton.textContent = '+ New Reaction';
			addReactionListEntryButton.contentEditable = false;
		}
	});

	return addReactionListEntryButton;
}

function createAddRoleListEntryButtonElement () {
	const addRoleListEntryButton = document.createElement('li');
	addRoleListEntryButton.id = 'addRoleListEntryButton';
	addRoleListEntryButton.classList.add('addReactionRoleButton');
	addRoleListEntryButton.textContent = '+ New Role';
	addRoleListEntryButton.addEventListener('click', () => {
		const options = [];
		for (const role of roles) options.push(new Option(role.name, role.id));

		const roleSelectElement = document.createElement('select');
		roleSelectElement.append(...options);
		roleSelectElement.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				const roleEntryElement = document.createElement('li');
				roleEntryElement.dataset.value = roleSelectElement.value;
				roleEntryElement.textContent = roles.find((role) => role.id === roleSelectElement.value).name;
				roleEntryElement.append(createDeleteListEntryButtonElement());

				roleSelectElement.parentElement.insertBefore(roleEntryElement, roleSelectElement);

				roleSelectElement.parentNode.replaceChild(addRoleListEntryButton, roleSelectElement);
			}
		});

		addRoleListEntryButton.parentNode.replaceChild(roleSelectElement, addRoleListEntryButton);
	});

	return addRoleListEntryButton;
}

function createRoleListEntryElement (data) {
	const entryElement = document.createElement('li');
	entryElement.dataset.value = data;
	entryElement.textContent = roles.find((role) => role.id === data).name;
	entryElement.append(createDeleteListEntryButtonElement());

	return entryElement;
}

function createListElement (allData, featurePath, setting) {
	const entries = [];
	for (const data of allData) entries.push(createListEntryElement(data));

	const listElement = document.createElement('ul');
	listElement.id = setting;
	listElement.append(...entries, createAddListEntryButtonElement());

	return listElement;
}

function createListEntryElement (data) {
	const entryElement = document.createElement('li');
	entryElement.dataset.value = data;
	entryElement.textContent = data;
	entryElement.append(createDeleteListEntryButtonElement());

	return entryElement;
}

function createDeleteListEntryButtonElement () {
	const deleteButtonElement = document.createElement('button');
	deleteButtonElement.type = 'button';
	deleteButtonElement.classList.add('deleteListEntryButton');
	deleteButtonElement.textContent = 'Delete';
	deleteButtonElement.addEventListener('click', () => deleteButtonElement.parentElement.remove());

	return deleteButtonElement;
}

function createAddListEntryButtonElement () {
	const addListEntryElement = document.createElement('li');
	addListEntryElement.id = 'addListEntryButton';
	addListEntryElement.textContent = '+';
	addListEntryElement.addEventListener('click', () => { addListEntryElement.textContent = ''; addListEntryElement.contentEditable = true; addListEntryElement.focus() });
	addListEntryElement.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			addListEntryElement.parentElement.insertBefore(createListEntryElement(addListEntryElement.textContent), addListEntryElement);
			addListEntryElement.textContent = '+';
			addListEntryElement.contentEditable = false;
		}
	});

	return addListEntryElement;
}

function createLabelElement (setting, element) {
	const labelElement = document.createElement('label');
	labelElement.textContent = translateJSON(setting);
	labelElement.append(element);

	return labelElement;
}

function translateJSON (name) {
	return translations.JSON[name] ?? name;
}

async function postFetch (url, data) {
	try {
		const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
		return await response.json();
	} catch (error) { console.error(error) }
}

function getProperty (data, path) {
	return path.split('.').reduce((a, b) => a?.[b], data);
}

function setProperty (data, path, value) {
	return path.split('.').reduce((a, b, i) => a[b] = path.split('.').length === ++i ? value : a[b] || {}, data);
}
