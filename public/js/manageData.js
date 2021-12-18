function displaySettingData (settingData, settingName) {
	const settingDataElement = document.getElementById('settingData');
	settingDataElement.textContent = JSON.stringify(settingData, null, 2);
	settingDataElement.dataset.setting = settingName;

	document.getElementById('enabledCheckbox').checked = settingData.enabled;
}

async function saveSettingData () {
	const data = {
		enabled: document.getElementById('enabledCheckbox').checked
	}

	const settingName = document.getElementById('settingData').dataset.setting;
	const response = await postFetch(`${window.location.href}/${settingName}/save`, data);

	document.getElementById(settingName).setAttribute('onclick', `displaySettingData(${JSON.stringify(response)}, '${settingName}')`);
	return displaySettingData(response, settingName);
}

async function postFetch (url, data) {
	try {
		const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
		return await response.json();
	} catch (error) { console.error(error) }
}
