export function generateSeasonString(season: number, episode?: number): string {
    return `S${!episode ? "eason " : ""}` +
        `${season < 10 && episode ? `0${season}` : season}` +
        `${episode ? `E${episode < 10 ? `0${episode}` : episode}` : ""}`;
}

export function getSeasonFromTitle(title: string): { cleanTitle: string, season: number } {
    const match = title.match(/[0-9]+$/);
    const result = match ? parseInt(match[0]) : null;

    return { cleanTitle: title, season: isNaN(result) ? 1 : result };
}

export function bytesFormatter(bytes: number): string {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}