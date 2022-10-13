import chalk, { Color } from "chalk";
import readLine from "readline";
import ms from "ms";
import { Torrent } from "webtorrent";

import { bytesFormatter } from "../helper/parsing";

// TODO: support terminal size changes

const statsLayout = new Map<string, number>([
    ["Progress:", 0],
    ["Size:", 25],
    ["Speed:", 40],
    ["Remaining:", 55],
]);

const windowsLayout = new Map<string, number>([
    ["logs", 6],
    ["errors", 14]
])

class Terminal {
    width: number;
    height: number;
    last: {
        torrents: Torrent[];
        logs: string[];
        errors: string[];
    };

    constructor() {
        const windowSize = process.stdout.getWindowSize();
        this.width = windowSize[0];
        this.height = windowSize[1];
        this.last = {
            torrents: [],
            logs: [],
            errors: [],
        }

        this.init();
    }

    init() {
        readLine.cursorTo(process.stdout, 0, 0);
        readLine.clearScreenDown(process.stdout);

        readLine.cursorTo(process.stdout, 0, 0);
        process.stdout.write(chalk.bold.green("📥 Torrents:"));

        for (const [title, postion] of statsLayout) {
            readLine.cursorTo(process.stdout, this.halfWidth + postion, 0)
            process.stdout.write(chalk.bold(title));
        }

        readLine.cursorTo(process.stdout, 0, windowsLayout.get("logs"));
        process.stdout.write(chalk.bold.cyan("📝 Logs:"));

        readLine.cursorTo(process.stdout, 0, windowsLayout.get("errors"));
        process.stdout.write(chalk.bold.yellow("⚠️ Errors:"));
    }

    get halfWidth(): number {
        return Math.round(this.width / 2)
    }

    log = (message: string | number) => {
        this.baseLog(message, "logs", "blue");
    }

    error = (message: string | number | Error) => {
        this.baseLog(message, "errors", "red");
    }

    baseLog = (message: string | number | Error, key: "logs" | "errors", color: typeof Color) => {
        if (typeof message !== "string") message = message.toString();

        const terminalFriendlyMsg = message.length > this.width - 5 ? message.slice(0, this.width - 7) + "..." : message;
        this.last[key].push(terminalFriendlyMsg);
        if (this.last[key].length > 6) this.last[key].shift();

        const windowY = windowsLayout.get(key);
        for (let i = 0; i < 6; i++) {
            readLine.cursorTo(process.stdout, 0, windowY + 1 + i)
            readLine.clearLine(process.stdout, 0);

            if (this.last[key][i]) process.stdout.write(chalk[color](this.last[key][i]));
        }
    }

    torrentInfo(torrent: Torrent) {
        const { name } = torrent;
        const existingIndex = this.last.torrents.indexOf(this.last.torrents.find(torrent => torrent.name === name));
        if (existingIndex !== -1) this.last.torrents[existingIndex] = torrent;
        else {
            this.last.torrents.push(torrent);
            if (this.last.torrents.length > 4) this.last.torrents.shift();
        }

        for (let i = 0; i < 4; i++) {
            readLine.cursorTo(process.stdout, 0, 1 + i)
            readLine.clearLine(process.stdout, 0);

            const currentInfo = this.last.torrents[i];
            if (currentInfo) {
                const terminalFriendlyName = currentInfo.name.length > this.halfWidth - 5 ?
                    currentInfo.name.slice(0, this.halfWidth - 7) + "..." : currentInfo.name;
                const timeRemaining = currentInfo.timeRemaining < 1 || !isFinite(currentInfo.timeRemaining) ?
                    chalk.green("Done!") : ms(currentInfo.timeRemaining);

                process.stdout.write(terminalFriendlyName)

                readLine.cursorTo(process.stdout, this.halfWidth + statsLayout.get("Progress:"), 1 + i);
                process.stdout.write(`[${chalk.green("\u2591").repeat(Math.floor(currentInfo.progress * 10))
                    + "\u2591".repeat(10 - Math.floor(currentInfo.progress * 10))}] (${(currentInfo.progress * 100).toFixed(2)}%)`);

                readLine.cursorTo(process.stdout, this.halfWidth + statsLayout.get("Size:"), 1 + i);
                process.stdout.write(bytesFormatter(currentInfo.length));

                readLine.cursorTo(process.stdout, this.halfWidth + statsLayout.get("Speed:"), 1 + i);
                process.stdout.write(bytesFormatter(currentInfo.downloadSpeed));

                readLine.cursorTo(process.stdout, this.halfWidth + statsLayout.get("Remaining:"), 1 + i);
                process.stdout.write(timeRemaining);
            }
        }
    }
}

const terminal = new Terminal();

export default terminal;