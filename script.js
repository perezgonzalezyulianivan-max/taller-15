"use strict";

/* ==========================================================
   TALLER 15 - SISTEMA DE GESTIÓN DE ESTUDIANTES
   JavaScript ES6+: CRUD, validaciones, filtros y LocalStorage
   ========================================================== */

/* ---------- 1. Constantes y estado de la aplicación ---------- */
const CLAVE_ALMACENAMIENTO = "taller15_estudiantes";
const NOTA_MINIMA = 0;
const NOTA_MAXIMA = 5;
const NOTA_APROBACION = 3.0;

const PROGRAMAS = [
  "Ingeniería de Sistemas",
  "Diseño Visual",
  "Administración de Empresas",
  "Contaduría Pública",
  "Licenciatura en Educación"
];

let estudiantes = [];
let idEnEdicion = null;
let temporizadorMensaje = null;

/* ---------- 2. Referencias a elementos del DOM ---------- */
const formulario = document.getElementById("formEstudiante");
const tituloFormulario = document.getElementById("tituloFormulario");
const campoNombre = document.getElementById("nombre");
const campoIdentificacion = document.getElementById("identificacion");
const campoCorreo = document.getElementById("correo");
const campoPrograma = document.getElementById("programa");
const campoCalificacion = document.getElementById("calificacion");
const botonGuardar = document.getElementById("btnGuardar");
const botonCancelar = document.getElementById("btnCancelar");
const mensaje = document.getElementById("mensaje");

const errorNombre = document.getElementById("errorNombre");
const errorIdentificacion = document.getElementById("errorIdentificacion");
const errorCorreo = document.getElementById("errorCorreo");
const errorPrograma = document.getElementById("errorPrograma");
const errorCalificacion = document.getElementById("errorCalificacion");

const buscarNombre = document.getElementById("buscarNombre");
const filtroPrograma = document.getElementById("filtroPrograma");
const filtroEstado = document.getElementById("filtroEstado");
const botonLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
const cuerpoTabla = document.getElementById("cuerpoTabla");
const contadorResultados = document.getElementById("contadorResultados");

const indTotal = document.getElementById("indTotal");
const indPromedio = document.getElementById("indPromedio");
const indAprobados = document.getElementById("indAprobados");
const indReprobados = document.getElementById("indReprobados");
const fechaActual = document.getElementById("fechaActual");

/* ---------- 3. Persistencia con LocalStorage ---------- */
function cargarEstudiantes() {
  try {
    const datos = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    const lista = datos ? JSON.parse(datos) : [];
    return Array.isArray(lista) ? lista : [];
  } catch (error) {
    console.error("No fue posible leer LocalStorage:", error);
    return [];
  }
}

function guardarEstudiantes() {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(estudiantes));
  } catch (error) {
    console.error("No fue posible guardar en LocalStorage:", error);
    mostrarMensaje("No fue posible guardar los datos en el navegador.", "error");
  }
}

/* ---------- 4. Funciones de apoyo ---------- */
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function obtenerEstado(nota) {
  return nota >= NOTA_APROBACION ? "Aprobado" : "Reprobado";
}

function calcularPromedio(lista) {
  if (lista.length === 0) {
    return 0;
  }
  const suma = lista.reduce((acumulado, estudiante) => acumulado + estudiante.nota, 0);
  return suma / lista.length;
}

function mostrarMensaje(texto, tipo) {
  clearTimeout(temporizadorMensaje);
  mensaje.textContent = texto;
  mensaje.className = "mensaje mensaje--" + tipo;
  temporizadorMensaje = setTimeout(() => {
    mensaje.textContent = "";
    mensaje.className = "mensaje";
  }, 4000);
}

/* ---------- 5. Indicadores del panel principal ---------- */
function actualizarIndicadores() {
  const total = estudiantes.length;
  const aprobados = estudiantes.filter((e) => obtenerEstado(e.nota) === "Aprobado").length;
  const reprobados = total - aprobados;

  indTotal.textContent = total;
  indPromedio.textContent = calcularPromedio(estudiantes).toFixed(2);
  indAprobados.textContent = aprobados;
  indReprobados.textContent = reprobados;
}

/* ---------- 6. Filtros y tabla ---------- */
function obtenerFiltrados() {
  const texto = normalizarTexto(buscarNombre.value.trim());
  const programa = filtroPrograma.value;
  const estado = filtroEstado.value;

  return estudiantes.filter((e) => {
    const coincideNombre = normalizarTexto(e.nombre).includes(texto);
    const coincidePrograma = programa === "todos" || e.programa === programa;
    const coincideEstado = estado === "todos" || obtenerEstado(e.nota) === estado;
    return coincideNombre && coincidePrograma && coincideEstado;
  });
}

function crearCelda(texto, clase) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  if (clase) {
    celda.className = clase;
  }
  return celda;
}

function crearBoton(texto, accion, id, clase) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = texto;
  boton.className = "btn btn--mini " + clase;
  boton.dataset.accion = accion;
  boton.dataset.id = id;
  return boton;
}

function renderizarTabla() {
  const lista = obtenerFiltrados();
  cuerpoTabla.textContent = "";
  contadorResultados.textContent =
    "Mostrando " + lista.length + " de " + estudiantes.length + " estudiantes";

  if (lista.length === 0) {
    const fila = document.createElement("tr");
    const celda = crearCelda(
      estudiantes.length === 0
        ? "Aún no hay estudiantes registrados."
        : "Ningún estudiante coincide con los filtros aplicados.",
      "vacio"
    );
    celda.colSpan = 8;
    fila.appendChild(celda);
    cuerpoTabla.appendChild(fila);
    return;
  }

  lista.forEach((estudiante, indice) => {
    const fila = document.createElement("tr");
    const estado = obtenerEstado(estudiante.nota);

    fila.appendChild(crearCelda(indice + 1));
    fila.appendChild(crearCelda(estudiante.identificacion));
    fila.appendChild(crearCelda(estudiante.nombre));
    fila.appendChild(crearCelda(estudiante.correo));
    fila.appendChild(crearCelda(estudiante.programa));
    fila.appendChild(crearCelda(estudiante.nota.toFixed(1), "nota"));

    const celdaEstado = document.createElement("td");
    const etiqueta = document.createElement("span");
    etiqueta.textContent = estado;
    etiqueta.className = "etiqueta etiqueta--" + estado.toLowerCase();
    celdaEstado.appendChild(etiqueta);
    fila.appendChild(celdaEstado);

    const celdaAcciones = document.createElement("td");
    const contenedorBotones = document.createElement("div");
    contenedorBotones.className = "acciones-fila";
    contenedorBotones.appendChild(
      crearBoton("Editar", "editar", estudiante.id, "btn--editar")
    );
    contenedorBotones.appendChild(
      crearBoton("Eliminar", "eliminar", estudiante.id, "btn--eliminar")
    );
    celdaAcciones.appendChild(contenedorBotones);
    fila.appendChild(celdaAcciones);

    cuerpoTabla.appendChild(fila);
  });
}

function actualizarPanel() {
  actualizarIndicadores();
  renderizarTabla();
}

function poblarProgramas() {
  PROGRAMAS.forEach((programa) => {
    campoPrograma.appendChild(new Option(programa, programa));
    filtroPrograma.appendChild(new Option(programa, programa));
  });
}

/* ---------- 7. Validaciones ---------- */
function mostrarError(campo, etiquetaError, texto) {
  campo.classList.add("invalido");
  etiquetaError.textContent = texto;
}

function limpiarErrores() {
  const pares = [
    [campoNombre, errorNombre],
    [campoIdentificacion, errorIdentificacion],
    [campoCorreo, errorCorreo],
    [campoPrograma, errorPrograma],
    [campoCalificacion, errorCalificacion]
  ];
  pares.forEach(([campo, etiquetaError]) => {
    campo.classList.remove("invalido");
    etiquetaError.textContent = "";
  });
}

function validarFormulario() {
  limpiarErrores();
  let valido = true;

  const nombre = campoNombre.value.trim().replace(/\s+/g, " ");
  const identificacion = campoIdentificacion.value.trim();
  const correo = campoCorreo.value.trim().toLowerCase();
  const programa = campoPrograma.value;
  const textoNota = campoCalificacion.value.trim().replace(",", ".");

  // Nombre completo
  if (nombre === "") {
    mostrarError(campoNombre, errorNombre, "El nombre completo es obligatorio.");
    valido = false;
  } else if (nombre.length < 3) {
    mostrarError(campoNombre, errorNombre, "El nombre debe tener al menos 3 caracteres.");
    valido = false;
  } else if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.'-]+$/.test(nombre)) {
    mostrarError(campoNombre, errorNombre, "El nombre solo puede contener letras.");
    valido = false;
  }

  // Identificación (obligatoria, numérica y sin duplicados)
  if (identificacion === "") {
    mostrarError(
      campoIdentificacion,
      errorIdentificacion,
      "La identificación es obligatoria."
    );
    valido = false;
  } else if (!/^\d{5,12}$/.test(identificacion)) {
    mostrarError(
      campoIdentificacion,
      errorIdentificacion,
      "Use solo números (5 a 12 dígitos)."
    );
    valido = false;
  } else if (
    estudiantes.some((e) => e.identificacion === identificacion && e.id !== idEnEdicion)
  ) {
    mostrarError(
      campoIdentificacion,
      errorIdentificacion,
      "Esta identificación ya está registrada."
    );
    valido = false;
  }

  // Correo electrónico
  const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (correo === "") {
    mostrarError(campoCorreo, errorCorreo, "El correo electrónico es obligatorio.");
    valido = false;
  } else if (!formatoCorreo.test(correo)) {
    mostrarError(campoCorreo, errorCorreo, "Ingrese un correo válido (ej: a@dominio.com).");
    valido = false;
  }

  // Programa académico
  if (programa === "" || !PROGRAMAS.includes(programa)) {
    mostrarError(campoPrograma, errorPrograma, "Seleccione un programa académico.");
    valido = false;
  }

  // Calificación (0.0 a 5.0 con máximo un decimal)
  const nota = Number(textoNota);
  if (textoNota === "") {
    mostrarError(campoCalificacion, errorCalificacion, "La calificación es obligatoria.");
    valido = false;
  } else if (Number.isNaN(nota)) {
    mostrarError(campoCalificacion, errorCalificacion, "La calificación debe ser numérica.");
    valido = false;
  } else if (nota < NOTA_MINIMA || nota > NOTA_MAXIMA) {
    mostrarError(
      campoCalificacion,
      errorCalificacion,
      "La calificación debe estar entre 0.0 y 5.0."
    );
    valido = false;
  } else if (Math.abs(nota * 10 - Math.round(nota * 10)) > 1e-9) {
    mostrarError(campoCalificacion, errorCalificacion, "Use máximo un decimal (ej: 3.5).");
    valido = false;
  }

  if (!valido) {
    return null;
  }
  return { nombre, identificacion, correo, programa, nota: Math.round(nota * 10) / 10 };
}

/* ---------- 8. Operaciones CRUD ---------- */
function limpiarFormulario() {
  formulario.reset();
  limpiarErrores();
  idEnEdicion = null;
  tituloFormulario.textContent = "Registrar estudiante";
  botonGuardar.textContent = "Registrar estudiante";
  botonCancelar.hidden = true;
}

function manejarEnvio(evento) {
  evento.preventDefault();
  const datos = validarFormulario();

  if (datos === null) {
    mostrarMensaje("Revise los campos marcados en rojo.", "error");
    return;
  }

  if (idEnEdicion !== null) {
    const posicion = estudiantes.findIndex((e) => e.id === idEnEdicion);
    if (posicion !== -1) {
      estudiantes[posicion] = { ...estudiantes[posicion], ...datos };
    }
    mostrarMensaje("Estudiante actualizado correctamente.", "exito");
  } else {
    estudiantes.push({ id: generarId(), ...datos });
    mostrarMensaje("Estudiante registrado correctamente.", "exito");
  }

  guardarEstudiantes();
  limpiarFormulario();
  actualizarPanel();
}

function editarEstudiante(id) {
  const estudiante = estudiantes.find((e) => e.id === id);
  if (!estudiante) {
    return;
  }

  limpiarErrores();
  idEnEdicion = id;
  campoNombre.value = estudiante.nombre;
  campoIdentificacion.value = estudiante.identificacion;
  campoCorreo.value = estudiante.correo;
  campoPrograma.value = estudiante.programa;
  campoCalificacion.value = estudiante.nota;

  tituloFormulario.textContent = "Editar estudiante";
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;

  formulario.scrollIntoView({ behavior: "smooth", block: "center" });
  campoNombre.focus();
}

function eliminarEstudiante(id) {
  const estudiante = estudiantes.find((e) => e.id === id);
  if (!estudiante) {
    return;
  }

  const confirmado = window.confirm("¿Desea eliminar a " + estudiante.nombre + "?");
  if (!confirmado) {
    return;
  }

  estudiantes = estudiantes.filter((e) => e.id !== id);
  if (idEnEdicion === id) {
    limpiarFormulario();
  }

  guardarEstudiantes();
  actualizarPanel();
  mostrarMensaje("Estudiante eliminado correctamente.", "exito");
}

/* ---------- 9. Eventos ---------- */
function limpiarFiltros() {
  buscarNombre.value = "";
  filtroPrograma.value = "todos";
  filtroEstado.value = "todos";
  renderizarTabla();
}

function registrarEventos() {
  formulario.addEventListener("submit", manejarEnvio);
  botonCancelar.addEventListener("click", limpiarFormulario);

  buscarNombre.addEventListener("input", renderizarTabla);
  filtroPrograma.addEventListener("change", renderizarTabla);
  filtroEstado.addEventListener("change", renderizarTabla);
  botonLimpiarFiltros.addEventListener("click", limpiarFiltros);

  // Delegación de eventos: un solo "click" para todos los botones de la tabla
  cuerpoTabla.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) {
      return;
    }
    if (boton.dataset.accion === "editar") {
      editarEstudiante(boton.dataset.id);
    } else if (boton.dataset.accion === "eliminar") {
      eliminarEstudiante(boton.dataset.id);
    }
  });

  // Al escribir en un campo se quita su mensaje de error
  [
    [campoNombre, errorNombre],
    [campoIdentificacion, errorIdentificacion],
    [campoCorreo, errorCorreo],
    [campoPrograma, errorPrograma],
    [campoCalificacion, errorCalificacion]
  ].forEach(([campo, etiquetaError]) => {
    const quitarError = () => {
      campo.classList.remove("invalido");
      etiquetaError.textContent = "";
    };
    campo.addEventListener("input", quitarError);
    campo.addEventListener("change", quitarError);
  });
}

/* ---------- 10. Inicio de la aplicación ---------- */
function iniciarAplicacion() {
  fechaActual.textContent = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  estudiantes = cargarEstudiantes();
  poblarProgramas();
  registrarEventos();
  actualizarPanel();
}

document.addEventListener("DOMContentLoaded", iniciarAplicacion);
