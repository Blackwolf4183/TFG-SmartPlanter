function formatDate(date){
    // Assuming strings with format "2024-03-03T12:25:36.900394 (coming from API)"
    const dateTime = new Date(date);
    const formattedDateTime = `${dateTime.getDate()}-${dateTime.getMonth() + 1}-${dateTime.getFullYear()} ${dateTime.getHours()}:${dateTime.getMinutes()}`;

    return formattedDateTime
}

export default formatDate