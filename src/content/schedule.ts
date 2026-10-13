export const scheduleCopy = {
  intro:
    'Sube el PDF de tu horario del portal académico. Enlazamos cada código de asignatura con la que tu profesor o profesora tiene en Polipuntos.',
  uploaded: 'Ya cargaste tu horario de este periodo. Puedes cargarlo de nuevo si cambió.',
  privacy:
    'Solo guardamos los códigos y nombres de tus asignaturas. El archivo no se almacena y tu documento de identidad solo se usa para comprobar que el horario es tuyo.',
  choose: 'Varios profesores tienen esta asignatura. Elige el tuyo:',
  unavailable: 'Todavía no hay una asignatura con este código. Cuando tu profesor la cree, usa «Buscar de nuevo».',
  notPdf: 'El archivo debe ser un PDF.',
  tooLarge: 'El archivo supera los 2 MB.',
  loadFailed: 'No se pudo cargar tu horario',
} as const;
