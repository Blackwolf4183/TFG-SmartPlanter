export function formatDate(date) {
    const dateTime = new Date(date);
    const formattedDateTime = `${dateTime.getDate()}-${dateTime.getMonth() + 1}-${dateTime.getFullYear()} ${dateTime.getHours()}:${dateTime.getMinutes()}`;

    return formattedDateTime;
}

const daysOfWeek = [
    'Lunes',
    'Martes',
    'Miercoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ];
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

export function getHeaderDate() {
    const date = new Date();
    const dayNumber = date.getDay();
    const monthNumber = date.getMonth();
    const dayOfMonth = date.getDate();

    const dayName = daysOfWeek[dayNumber];
    const monthName = months[monthNumber];
    const year = date.getFullYear();

    const fullDateString = dayName + ' ' + dayOfMonth + ' ' + monthName + ' ' + year

    return fullDateString
}

