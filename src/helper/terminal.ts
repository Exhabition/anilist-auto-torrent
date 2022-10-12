import chalk from "chalk";
import readLine from "readline";
import ms from "ms";
import { Torrent } from "webtorrent";

import { bytesFormatter } from "../helper/parsing";

const windowSize = process.stdout.getWindowSize();
const [width] = windowSize;
const halfWindow = Math.round(width / 2);

// TODO: support terminal size changes

export function initTerminal() {
    readLine.cursorTo(process.stdout, 0, 0);
    readLine.clearScreenDown(process.stdout);

    readLine.cursorTo(process.stdout, 0, 0);
    process.stdout.write(chalk.bold.green("📥 Torrents:"));

    readLine.cursorTo(process.stdout, halfWindow, 0)
    process.stdout.write(chalk.bold("Progress:"));

    readLine.cursorTo(process.stdout, halfWindow + 25, 0)
    process.stdout.write(chalk.bold("Size:"));

    readLine.cursorTo(process.stdout, halfWindow + 40, 0)
    process.stdout.write(chalk.bold("Speed:"));

    readLine.cursorTo(process.stdout, halfWindow + 55, 0)
    process.stdout.write(chalk.bold("Remaining:"));

    readLine.cursorTo(process.stdout, 0, 6);
    process.stdout.write(chalk.bold.cyan("📝 Logs:"));

    readLine.cursorTo(process.stdout, 0, 14);
    process.stdout.write(chalk.bold.yellow("⚠️ Errors:"));
}

// Log at line 1 - 4
const lastTorrents: Torrent[] = [];
export function torrentInfo(torrent: Torrent) {
    const { name } = torrent;
    const existingIndex = lastTorrents.indexOf(lastTorrents.find(torrent => torrent.name === name));
    if (existingIndex !== -1) lastTorrents[existingIndex] = torrent;
    else {
        lastTorrents.push(torrent);
        if (lastTorrents.length > 4) lastTorrents.shift();
    }

    for (let i = 0; i < 4; i++) {
        readLine.cursorTo(process.stdout, 0, 1 + i)
        readLine.clearLine(process.stdout, 0);

        const currentInfo = lastTorrents[i];
        if (currentInfo) {
            const terminalFriendlyName = currentInfo.name.length > halfWindow - 5 ? currentInfo.name.slice(0, halfWindow - 7) + "..." : currentInfo.name;
            const timeRemaining = currentInfo.timeRemaining < 1 || !isFinite(currentInfo.timeRemaining) ?
                chalk.green("Done!") : ms(currentInfo.timeRemaining);

            process.stdout.write(terminalFriendlyName)
            readLine.cursorTo(process.stdout, halfWindow, 1 + i);
            process.stdout.write(`[${chalk.green("\u2591").repeat(Math.floor(currentInfo.progress * 10))
                + "\u2591".repeat(10 - Math.floor(currentInfo.progress * 10))}] (${(currentInfo.progress * 100).toFixed(2)}%)`);
            readLine.cursorTo(process.stdout, halfWindow + 25, 1 + i);
            process.stdout.write(bytesFormatter(currentInfo.length));
            readLine.cursorTo(process.stdout, halfWindow + 40, 1 + i);
            process.stdout.write(bytesFormatter(currentInfo.downloadSpeed));
            readLine.cursorTo(process.stdout, halfWindow + 55, 1 + i);
            process.stdout.write(timeRemaining);
        }
    }
}

// Log at line 9 - 15
const lastLogs: string[] = [];
export function log(message: string) {
    const terminalFriendlyMsg = message.length > width - 5 ? message.slice(0, width - 7) + "..." : message;
    lastLogs.push(terminalFriendlyMsg);
    if (lastLogs.length > 6) lastLogs.shift();

    for (let i = 0; i < 6; i++) {
        readLine.cursorTo(process.stdout, 0, 7 + i)
        readLine.clearLine(process.stdout, 0);

        if (lastLogs[i]) process.stdout.write(chalk.blue(lastLogs[i]));
    }
}

// Error at line 17 - 23
const lastErrors: string[] = [];
export function error(message: string | Error) {
    if (typeof message !== "string") message = message.toString()

    const terminalFriendlyMsg = message.length > 125 ? message.slice(0, 122) + "..." : message;
    lastErrors.push(terminalFriendlyMsg);
    if (lastErrors.length > 6) lastErrors.shift();

    for (let i = 0; i < 6; i++) {
        readLine.cursorTo(process.stdout, 0, 15 + i)
        readLine.clearLine(process.stdout, 0);

        if (lastErrors[i]) process.stdout.write(chalk.red(lastErrors[i]));
    }
}