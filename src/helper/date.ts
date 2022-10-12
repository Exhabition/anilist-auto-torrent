export function isInPast(date?: { year: number, day: number, month: number }): boolean {
    if (!date) return false;

    const today = new Date();
    const currentDay = today.getDay()
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const { year, month, day } = date;

    if (year < currentYear) return true;
    if (month < currentMonth && year === currentYear) return true;
    if (day < currentDay && month === currentMonth && year === currentYear) return true;

    return false;
}