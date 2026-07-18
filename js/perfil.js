(function () {
  'use strict';

  const SETTINGS_KEY = 'uthub_profile_settings';

  function readJson(key, fallback = {}) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function initials(user) {
    const nombre = String(user.nombre || 'U').trim();
    const apellido = String(user.apellido || '').trim();
    return `${nombre.charAt(0)}${apellido.charAt(0) || 'T'}`.toUpperCase();
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '';
  }

  function renderAvatar(user, settings) {
    const avatar = document.getElementById('profile-avatar');
    if (!avatar) return;

    const imageUrl = settings.avatarUrl || '';
    if (imageUrl) {
      avatar.innerHTML = `<img src="${imageUrl.replaceAll('"', '&quot;')}" alt="Foto de perfil">`;
      return;
    }

    avatar.textContent = initials(user);
  }

  function renderProfile() {
    const user = readJson('uthub_user');
    const settings = readJson(SETTINGS_KEY);

    const merged = {
      ...user,
      carrera: settings.carrera || user.carrera || '',
      telefono: settings.telefono || '',
      avatarUrl: settings.avatarUrl || ''
    };

    setValue('profile-nombre', merged.nombre);
    setValue('profile-apellido', merged.apellido);
    setValue('profile-email', merged.email);
    setValue('profile-matricula', merged.matricula || (merged.email ? merged.email.split('@')[0] : ''));
    setValue('profile-carrera', merged.carrera);
    setValue('profile-avatar-url', merged.avatarUrl);
    setValue('profile-telefono', merged.telefono);

    const fullName = `${merged.nombre || ''} ${merged.apellido || ''}`.trim() || 'UThub';
    setText('summary-name', fullName);
    setText('summary-role', merged.rol || 'estudiante');
    setText('summary-email', merged.email || 'Sin correo');

    renderAvatar(merged, merged);
  }

  function saveProfile(event) {
    event.preventDefault();

    const user = readJson('uthub_user');
    const updatedUser = {
      ...user,
      nombre: document.getElementById('profile-nombre')?.value.trim() || user.nombre,
      apellido: document.getElementById('profile-apellido')?.value.trim() || user.apellido
    };

    const settings = {
      carrera: document.getElementById('profile-carrera')?.value.trim() || '',
      avatarUrl: document.getElementById('profile-avatar-url')?.value.trim() || '',
      telefono: document.getElementById('profile-telefono')?.value.trim() || ''
    };

    saveJson('uthub_user', updatedUser);
    saveJson(SETTINGS_KEY, settings);
    renderProfile();

    const status = document.getElementById('profile-status');
    if (status) {
      status.textContent = 'Perfil guardado correctamente en este navegador.';
      setTimeout(() => {
        status.textContent = '';
      }, 3500);
    }
  }

  function logout() {
    localStorage.removeItem('uthub_token');
    localStorage.removeItem('uthub_user');
    window.location.href = '../auth/login.html';
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderProfile();
    document.getElementById('profile-form')?.addEventListener('submit', saveProfile);
    document.getElementById('profile-logout')?.addEventListener('click', logout);
  });
})();
