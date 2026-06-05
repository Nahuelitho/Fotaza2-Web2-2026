(function () {
  var modalPublicacion = document.getElementById('post-modal');
  var modalAutenticacion = document.getElementById('auth-required-modal');

  function configurarModal(modal, selectorBotonAbrir, selectorBotonCerrar) {
    var botonAbrir = document.querySelector(selectorBotonAbrir);
    var botonesCerrar = document.querySelectorAll(selectorBotonCerrar);

    if (!modal || !botonAbrir) return;

    botonAbrir.addEventListener('click', function () {
      modal.hidden = false;
    });

    botonesCerrar.forEach(function (boton) {
      boton.addEventListener('click', function () {
        modal.hidden = true;
      });
    });

    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        modal.hidden = true;
      }
    });
  }

  configurarModal(modalPublicacion, '[data-abrir-modal-publicacion="true"]', '[data-cerrar-modal-publicacion="true"]');
  configurarModal(modalAutenticacion, '[data-abrir-modal-autenticacion="true"]', '[data-cerrar-modal-autenticacion="true"]');

  if (!modalPublicacion) return;

  var formulario = modalPublicacion.querySelector('form');
  var inputImagen = modalPublicacion.querySelector('input[name="imagen"]');
  var selectLicencia = modalPublicacion.querySelector('[data-tipo-licencia="true"]');
  var inputMarcaAgua = modalPublicacion.querySelector('[data-marca-agua="true"]');
  var selectEtiqueta = modalPublicacion.querySelector('[data-select-etiqueta="true"]');
  var botonAgregarEtiquetaExistente = modalPublicacion.querySelector('[data-agregar-etiqueta-existente="true"]');
  var inputEtiquetaNueva = modalPublicacion.querySelector('[data-etiqueta-nueva="true"]');
  var botonCrearEtiquetaNueva = modalPublicacion.querySelector('[data-crear-etiqueta-nueva="true"]');
  var contenedorEtiquetasElegidas = modalPublicacion.querySelector('[data-etiquetas-elegidas="true"]');

  function contarEtiquetasElegidas() {
    if (!contenedorEtiquetasElegidas) return 0;
    return contenedorEtiquetasElegidas.querySelectorAll('input[name="etiquetasExistentes"]').length;
  }

  function etiquetaYaElegida(nombreEtiqueta) {
    if (!contenedorEtiquetasElegidas) return false;
    var inputsSeleccionados = contenedorEtiquetasElegidas.querySelectorAll('input[name="etiquetasExistentes"]');
    return Array.prototype.some.call(inputsSeleccionados, function (inputSeleccionado) {
      return inputSeleccionado.value === nombreEtiqueta;
    });
  }

  function agregarEtiquetaElegida(nombreEtiqueta) {
    if (!contenedorEtiquetasElegidas) return;
    var nombreEtiquetaNormalizado = nombreEtiqueta.trim().toLowerCase();

    if (!nombreEtiquetaNormalizado) return;

    if (contarEtiquetasElegidas() >= 3) {
      alert('Solo podes elegir hasta 3 etiquetas.');
      return;
    }

    if (etiquetaYaElegida(nombreEtiquetaNormalizado)) {
      alert('Esa etiqueta ya fue agregada.');
      return;
    }

    var etiquetaChip = document.createElement('span');
    etiquetaChip.className = 'ini-tag-elegido';
    etiquetaChip.textContent = nombreEtiquetaNormalizado;

    var inputOculto = document.createElement('input');
    inputOculto.type = 'hidden';
    inputOculto.name = 'etiquetasExistentes';
    inputOculto.value = nombreEtiquetaNormalizado;

    var botonQuitar = document.createElement('button');
    botonQuitar.type = 'button';
    botonQuitar.textContent = 'x';
    botonQuitar.setAttribute('aria-label', 'Quitar etiqueta ' + nombreEtiquetaNormalizado);
    botonQuitar.addEventListener('click', function () {
      etiquetaChip.remove();
    });

    etiquetaChip.appendChild(inputOculto);
    etiquetaChip.appendChild(botonQuitar);
    contenedorEtiquetasElegidas.appendChild(etiquetaChip);
  }

  function actualizarEstadoMarcaAgua() {
    if (!selectLicencia || !inputMarcaAgua) return;
    var requiereMarcaAgua = selectLicencia.value === 'con_copyright';
    inputMarcaAgua.required = requiereMarcaAgua;
    inputMarcaAgua.disabled = !requiereMarcaAgua;
    if (!requiereMarcaAgua) {
      inputMarcaAgua.value = '';
    }
  }

  if (selectLicencia) {
    selectLicencia.addEventListener('change', actualizarEstadoMarcaAgua);
    actualizarEstadoMarcaAgua();
  }

  if (botonAgregarEtiquetaExistente && selectEtiqueta) {
    botonAgregarEtiquetaExistente.addEventListener('click', function () {
      agregarEtiquetaElegida(selectEtiqueta.value);
      selectEtiqueta.value = '';
    });
  }

  if (botonCrearEtiquetaNueva && inputEtiquetaNueva) {
    botonCrearEtiquetaNueva.addEventListener('click', function () {
      agregarEtiquetaElegida(inputEtiquetaNueva.value);
      inputEtiquetaNueva.value = '';
    });
  }

  if (formulario && inputImagen) {
    formulario.addEventListener('submit', function (event) {
      var archivo = inputImagen.files && inputImagen.files[0];
      var cantidadTags = contarEtiquetasElegidas();

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

      if (!archivo) return;

      if (archivo.size > 2 * 1024 * 1024) {
        event.preventDefault();
        alert('La imagen supera el tamano maximo permitido (2MB).');
      }
    });
  }

  if (window.location.search.indexOf('estado=creada') >= 0 || window.location.search.indexOf('error=') >= 0) {
    window.history.replaceState({}, document.title, '/');
  }
})();
