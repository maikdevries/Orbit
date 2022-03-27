(() => {
	window.localStorage.setItem('theme', window.localStorage.getItem('theme') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'colour'));
	if (window.localStorage.getItem('theme') === 'dark') { document.documentElement.classList.add('dark'); document.getElementById('themeSwitchToggle').checked = true }
})();

window.expandUserProfileDropdown = (event) => {
	event.stopPropagation();

	const dropDownElementStyle = document.getElementById('userProfileDropdown').style;
	dropDownElementStyle.visibility = 'visible';
	dropDownElementStyle.opacity = 1;

	document.getElementById('userProfile').onclick = null;
	document.onclick = closeUserProfileDropdown;
}

const closeUserProfileDropdown = (event) => {
	event.stopPropagation();

	if (event.target.closest('#userProfileDropdown')) return;

	const dropDownElementStyle = document.getElementById('userProfileDropdown').style;
	dropDownElementStyle.visibility = 'hidden';
	dropDownElementStyle.opacity = 0;

	document.onclick = null;
	document.getElementById('userProfile').onclick = expandUserProfileDropdown;
}

window.toggleTheme = () => {
	document.documentElement.classList.toggle('dark');
	window.localStorage.setItem('theme', window.localStorage.getItem('theme') === 'colour' ? 'dark' : 'colour');
}