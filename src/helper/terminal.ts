import chalk, { Color } from "chalk";
import readLine from "readline";
import ms from "ms";
import os from "os";
import checkDiskSpace from 'check-disk-space'
import { Torrent } from "webtorrent";

import { bytesFormatter } from "../helper/parsing";
import { loadingBar } from "../helper/styling"

import { savePath } from "../config.json"

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
    timer: NodeJS.Timer | null;

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
        process.stdout.write(chalk.bold.green("📥 Torrents "));

        for (const [title, postion] of statsLayout) {
            readLine.cursorTo(process.stdout, this.halfWidth + postion, 0)
            process.stdout.write(chalk.bold(title));
        }

        readLine.cursorTo(process.stdout, 0, windowsLayout.get("logs"));
        process.stdout.write(chalk.bold.cyan("📝 Logs:"));

        readLine.cursorTo(process.stdout, this.halfWidth, windowsLayout.get("logs"));
        process.stdout.write(chalk.bold.magenta("🖥️ System:"));

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

        const terminalFriendlyMsg = message.length > this.halfWidth - 5 ? message.slice(0, this.halfWidth - 7) + "..." : message;
        this.last[key].push(terminalFriendlyMsg);
        if (this.last[key].length > 6) this.last[key].shift();

        const windowY = windowsLayout.get(key);
        for (let i = 0; i < 6; i++) {
            readLine.cursorTo(process.stdout, this.halfWidth - 1, windowY + 1 + i)
            readLine.clearLine(process.stdout, -1);
            readLine.cursorTo(process.stdout, 0, windowY + 1 + i);

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
                const timeRemaining = currentInfo.done ? chalk.green("Done!") :
                    currentInfo.timeRemaining < 1 || !isFinite(currentInfo.timeRemaining) ?
                        chalk.red("Failing.") : ms(currentInfo.timeRemaining);

                process.stdout.write(terminalFriendlyName)

                readLine.cursorTo(process.stdout, this.halfWidth + statsLayout.get("Progress:"), 1 + i);
                process.stdout.write(`${loadingBar(currentInfo.progress)}`);

                readLine.cursorTo(process.stdout, this.halfWidth + statsLayout.get("Size:"), 1 + i);
                process.stdout.write(bytesFormatter(currentInfo.length));

                readLine.cursorTo(process.stdout, this.halfWidth + statsLayout.get("Speed:"), 1 + i);
                process.stdout.write(bytesFormatter(currentInfo.downloadSpeed));

                readLine.cursorTo(process.stdout, this.halfWidth + statsLayout.get("Remaining:"), 1 + i);
                process.stdout.write(timeRemaining);
            }
        }
    }

    clientInfo = (stats: { active: number, pending: number, done: number, total: number }) => {
        const { active, pending, done, total } = stats;

        readLine.cursorTo(process.stdout, 0, 0);
        process.stdout.write(chalk.bold.green("📥 Torrents ") +
            `(${active} ${chalk.green("active")}, ` +
            `${pending} ${chalk.hex('#FFA500')("pending")}, ` +
            `${done} ${chalk.hex('#FFA500')("done")}, ` +
            `${total} ${chalk.blue("total")})`);
    }

    processUsage = async () => {
        const cpuStats = os.cpus().map(cpu => {
            const value = cpu.times;
            const total = value.user + value.nice + value.sys + value.idle + value.irq;

            return ((total - value.idle) / total) * 100
        })
        const cpuUsage = cpuStats.reduce((previousValue, currentValue) => previousValue + currentValue);

        readLine.cursorTo(process.stdout, this.halfWidth, windowsLayout.get("logs") + 1);
        readLine.clearLine(process.stdout, 1);
        process.stdout.write(`${os.cpus()[0].model.trimEnd()} - ${cpuUsage.toFixed(2)}% CPU`)

        const memoryFreePercentage = os.freemem() / os.totalmem();
        const usedPercentage = 1 - memoryFreePercentage;

        readLine.cursorTo(process.stdout, this.halfWidth, windowsLayout.get("logs") + 3);
        process.stdout.write(`RAM: ${bytesFormatter(os.totalmem() - os.freemem())}/${bytesFormatter(os.totalmem())} Memory ` +
            `${loadingBar(usedPercentage, "blue")}`);

        const diskInfo = await checkDiskSpace(savePath);

        readLine.cursorTo(process.stdout, this.halfWidth, windowsLayout.get("logs") + 4);
        process.stdout.write(`Disk: ${bytesFormatter(diskInfo.size - diskInfo.free)}/${bytesFormatter(diskInfo.size)} ` +
            `${loadingBar(1 - diskInfo.free / diskInfo.size, "red")}`);
    }
}

const terminal = new Terminal();

export default terminal;