(function () {
  'use strict';

  const SEARCH_API = 'https://es.wikipedia.org/w/rest.php/v1/search/page';
  const SUMMARY_API = 'https://es.wikipedia.org/api/rest_v1/page/summary/';

  function createAssistant() {
    if (document.getElementById('wiki-assistant-overlay')) return;

    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'wiki-assistant-launcher';
    launcher.setAttribute('aria-haspopup', 'dialog');
    launcher.setAttribute('aria-controls', 'wiki-assistant-modal');
    launcher.innerHTML = `
      <span class="wiki-assistant-launcher-icon" aria-hidden="true">W</span>
      <span class="wiki-assistant-launcher-text">Preg�ntale a Wiki</span>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'wiki-assistant-overlay';
    overlay.className = 'wiki-assistant-overlay';
    overlay.innerHTML = `
      <section class="wiki-assistant-modal" id="wiki-assistant-modal" role="dialog" aria-modal="true" aria-labelledby="wiki-assistant-title">
        <header class="wiki-assistant-header">
          <span class="wiki-assistant-eyebrow">Wikipedia REST API</span>
          <h2 class="wiki-assistant-title" id="wiki-assistant-title">�Tienes preguntas? �Resu�lvelas con Wiki!</h2>
          <p class="wiki-assistant-description">Escribe un tema y consulta un resumen de Wikipedia sin salir de UThub.</p>
          <button class="wiki-assistant-close" type="button" aria-label="Cerrar asistente">&times;</button>
        </header>
        <div class="wiki-assistant-body">
          <form class="wiki-assistant-form" id="wiki-assistant-form">
            <label class="sr-only" for="wiki-assistant-input">Tema para buscar en Wikipedia</label>
            <input class="wiki-assistant-input" id="wiki-assistant-input" type="search" placeholder="Ej. c�lculo diferencial, nutrici�n, JavaScript..." autocomplete="off" required>
            <button class="wiki-assistant-submit" type="submit">Buscar</button>
          </form>
          <p class="wiki-assistant-status" id="wiki-assistant-status" role="status" aria-live="polite">Busca cualquier tema para comenzar.</p>
          <article class="wiki-assistant-result" id="wiki-assistant-result" aria-live="polite"></article>
        </div>
      </section>
    `;

    document.body.append(launcher, overlay);

    const modal = overlay.querySelector('.wiki-assistant-modal');
    const closeButton = overlay.querySelector('.wiki-assistant-close');
    const form = overlay.querySelector('#wiki-assistant-form');
    const input = overlay.querySelector('#wiki-assistant-input');
    const submit = overlay.querySelector('.wiki-assistant-submit');
    const status = overlay.querySelector('#wiki-assistant-status');
    const result = overlay.querySelector('#wiki-assistant-result');
    let lastFocusedElement = null;

    function openModal() {
      lastFocusedElement = document.activeElement;
      overlay.classList.add('is-open');
      document.body.classList.add('wiki-assistant-lock');
      input.focus();
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      document.body.classList.remove('wiki-assistant-lock');
      if (lastFocusedElement) lastFocusedElement.focus();
    }

    function renderResult(data) {
      result.innerHTML = '';

      if (data.thumbnail?.source) {
        const image = document.createElement('img');
        image.className = 'wiki-assistant-result-image';
        image.src = data.thumbnail.source;
        image.alt = data.title ? `Imagen de ${data.title}` : 'Imagen de Wikipedia';
        result.appendChild(image);
      }

      const title = document.createElement('h3');
      title.className = 'wiki-assistant-result-title';
      title.textContent = data.title || 'Resultado de Wikipedia';

      const copy = document.createElement('p');
      copy.className = 'wiki-assistant-result-copy';
      copy.textContent = data.extract || 'Wikipedia no ofrece un resumen para este tema.';

      const link = document.createElement('a');
      link.className = 'wiki-assistant-result-link';
      link.href = data.content_urls?.desktop?.page || `https://es.wikipedia.org/wiki/${encodeURIComponent(data.title || '')}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Leer art�culo completo en Wikipedia';

      result.append(title, copy, link);
      result.classList.add('is-visible');
    }

    async function searchWikipedia(query) {
      const searchUrl = `${SEARCH_API}?q=${encodeURIComponent(query)}&limit=1`;
      const searchResponse = await fetch(searchUrl, {
        headers: { Accept: 'application/json' }
      });
      if (!searchResponse.ok) throw new Error('No fue posible consultar Wikipedia.');

      const searchData = await searchResponse.json();
      const match = searchData.pages?.[0];
      if (!match?.key) return null;

      const summaryResponse = await fetch(`${SUMMARY_API}${encodeURIComponent(match.key)}`, {
        headers: { Accept: 'application/json' }
      });
      if (!summaryResponse.ok) throw new Error('No fue posible cargar el resumen.');
      return summaryResponse.json();
    }

    launcher.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closeModal();
    });
    modal.addEventListener('click', event => event.stopPropagation());
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      submit.disabled = true;
      result.classList.remove('is-visible');
      status.textContent = `Buscando "${query}" en Wikipedia...`;

      try {
        const data = await searchWikipedia(query);
        if (!data) {
          status.textContent = 'No encontramos resultados. Prueba con un t�rmino m�s espec�fico.';
          result.innerHTML = '';
          return;
        }
        renderResult(data);
        status.textContent = 'Resultado encontrado.';
      } catch (error) {
        status.textContent = 'Wikipedia no est� disponible en este momento. Intenta nuevamente.';
        result.innerHTML = '';
      } finally {
        submit.disabled = false;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createAssistant);
  } else {
    createAssistant();
  }
})();
