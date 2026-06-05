(function () {
  var postModal = document.getElementById('post-modal');
  var authModal = document.getElementById('auth-required-modal');

  function configurarModal(modal, openButtonSelector, closeButtonSelector) {
    var openButton = document.querySelector(openButtonSelector);
    var closeButtons = document.querySelectorAll(closeButtonSelector);

    if (!modal || !openButton) return;

    openButton.addEventListener('click', function () {
      modal.hidden = false;
    });

    closeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        modal.hidden = true;
      });
    });

    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        modal.hidden = true;
      }
    });
  }

  configurarModal(postModal, '[data-open-post-modal="true"]', '[data-close-post-modal="true"]');
  configurarModal(authModal, '[data-open-auth-modal="true"]', '[data-close-auth-modal="true"]');

  if (!postModal) return;

  var form = postModal.querySelector('form');
  var imageInput = postModal.querySelector('input[name="imagen"]');
  var licenseSelect = postModal.querySelector('[data-license-type="true"]');
  var watermarkInput = postModal.querySelector('[data-watermark="true"]');
  var tagSelect = postModal.querySelector('[data-tag-select="true"]');
  var addExistingTagButton = postModal.querySelector('[data-add-existing-tag="true"]');
  var newTagInput = postModal.querySelector('[data-new-tag="true"]');
  var addNewTagButton = postModal.querySelector('[data-add-new-tag="true"]');
  var selectedTagsContainer = postModal.querySelector('[data-selected-tags="true"]');

  function countSelectedTags() {
    if (!selectedTagsContainer) return 0;
    return selectedTagsContainer.querySelectorAll('input[name="etiquetasExistentes"]').length;
  }

  function tagAlreadySelected(tagName) {
    if (!selectedTagsContainer) return false;
    var selectedInputs = selectedTagsContainer.querySelectorAll('input[name="etiquetasExistentes"]');
    return Array.prototype.some.call(selectedInputs, function (input) {
      return input.value === tagName;
    });
  }

  function addSelectedTag(tagName) {
    if (!selectedTagsContainer) return;
    var normalizedTagName = tagName.trim().toLowerCase();

    if (!normalizedTagName) return;

    if (countSelectedTags() >= 3) {
      alert('Solo podes elegir hasta 3 etiquetas.');
      return;
    }

    if (tagAlreadySelected(normalizedTagName)) {
      alert('Esa etiqueta ya fue agregada.');
      return;
    }

    var tagChip = document.createElement('span');
    tagChip.className = 'ini-tag-elegido';
    tagChip.textContent = normalizedTagName;

    var hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'etiquetasExistentes';
    hiddenInput.value = normalizedTagName;

    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'x';
    removeButton.setAttribute('aria-label', 'Quitar etiqueta ' + normalizedTagName);
    removeButton.addEventListener('click', function () {
      tagChip.remove();
    });

    tagChip.appendChild(hiddenInput);
    tagChip.appendChild(removeButton);
    selectedTagsContainer.appendChild(tagChip);
  }

  function updateWatermarkState() {
    if (!licenseSelect || !watermarkInput) return;
    var requiresWatermark = licenseSelect.value === 'con_copyright';
    watermarkInput.required = requiresWatermark;
    watermarkInput.disabled = !requiresWatermark;
    if (!requiresWatermark) {
      watermarkInput.value = '';
    }
  }

  if (licenseSelect) {
    licenseSelect.addEventListener('change', updateWatermarkState);
    updateWatermarkState();
  }

  if (addExistingTagButton && tagSelect) {
    addExistingTagButton.addEventListener('click', function () {
      addSelectedTag(tagSelect.value);
      tagSelect.value = '';
    });
  }

  if (addNewTagButton && newTagInput) {
    addNewTagButton.addEventListener('click', function () {
      addSelectedTag(newTagInput.value);
      newTagInput.value = '';
    });
  }

  if (form && imageInput) {
    form.addEventListener('submit', function (event) {
      var file = imageInput.files && imageInput.files[0];
      var cantidadTags = countSelectedTags();

      if (cantidadTags === 0) {
        event.preventDefault();
        alert('Debes elegir al menos una etiqueta.');
        return;
      }

      if (cantidadTags > 3) {
        event.preventDefault();
        alert('Solo podes elegir hasta 3 etiquetas.');
        return;
      }

      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        event.preventDefault();
        alert('La imagen supera el tamano maximo permitido (2MB).');
      }
    });
  }

  if (window.location.search.indexOf('estado=creada') >= 0 || window.location.search.indexOf('error=') >= 0) {
    window.history.replaceState({}, document.title, '/');
  }
})();
