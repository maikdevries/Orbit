const openDropDownEventListener = ((event) => {
	event.stopPropagation();

	const dropDownElementStyle = document.getElementById('userDropdown').style;
	dropDownElementStyle.visibility = 'visible';
	dropDownElementStyle.opacity = 1;

	document.getElementById('userProfile').onclick = null;
	document.onclick = closeDropDownEventListener;
});

const closeDropDownEventListener = ((event) => {
	event.stopPropagation();

	if (event.target.closest('#userDropdown')) return;

	const dropDownElementStyle = document.getElementById('userDropdown').style;
	dropDownElementStyle.visibility = 'hidden';
	dropDownElementStyle.opacity = 0;

	document.onclick = null;
	document.getElementById('userProfile').onclick = openDropDownEventListener;
});

(() => {
	window.localStorage.setItem('theme', window.localStorage.getItem('theme') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'colour'));
	if (window.localStorage.getItem('theme') === 'dark') { document.documentElement.classList.add('dark'); document.getElementById('themeSwitchToggle').checked = true }

	if (document.getElementById('userProfile')) document.getElementById('userProfile').onclick = openDropDownEventListener;
})();

function toggleTheme () {
	document.documentElement.classList.toggle('dark');
	window.localStorage.setItem('theme', window.localStorage.getItem('theme') === 'colour' ? 'dark' : 'colour');
}
