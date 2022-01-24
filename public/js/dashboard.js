(() => {
	window.sessionStorage.setItem('sidebarCollapsed', window.sessionStorage.getItem('sidebarCollapsed') ?? 'false');
	if (window.sessionStorage.getItem('sidebarCollapsed') === 'true') document.getElementById('featureSidebar').classList.toggle('collapsedSidebar');

	const categoryLinkPath = document.location.pathname.substring(document.location.pathname.lastIndexOf('/') + 1);
	if (document.getElementById(categoryLinkPath)) document.getElementById(categoryLinkPath).classList.add('currentPage');
})();

function toggleCollapseSidebar () {
	document.getElementById('featureSidebar').classList.toggle('collapsedSidebar');
	window.sessionStorage.setItem('sidebarCollapsed', window.sessionStorage.getItem('sidebarCollapsed') === 'false' ? 'true' : 'false');
}
