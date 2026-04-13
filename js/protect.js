(function() {
  const token = localStorage.getItem('uthub_token');
  if (!token) {
    const base = window.location.origin + window.location.pathname.split('/pages/')[0];
    window.location.href = base + '/pages/auth/login.html';
  }
})();