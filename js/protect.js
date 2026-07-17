(function() {
  const token = localStorage.getItem('uthub_token');
  if (!token) {
    const path = window.location.pathname;
    const base = path.includes('/pages/')
      ? window.location.origin + path.split('/pages/')[0]
      : window.location.origin;
    window.location.href = base + '/pages/auth/login.html';
  }
})();
