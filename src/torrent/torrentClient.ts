import WebTorrent from "webtorrent";
import chalk from "chalk";

import terminal from "../helper/terminal";

import config from "../config/config"
const { savePath, maxActiveTorrents } = config;

const client = new WebTorrent();

const pending = new Set<{
    magnet: string,
    subPath: "Movies" | "Series",
}>();
const failing = new Set<string>();

client.on("error", (err) => {
    terminal.error(err);
})

client.on('torrent', torrent => {
    terminal.log(torrent.name);
});

export function addTorrent(magnetUrl: string, subPath: "Movies" | "Series") {
    const activeTorrents = client.torrents.filter(torrent => !torrent.paused && !torrent.done);
    if (activeTorrents.length < maxActiveTorrents) {
        const torrent = client.add(magnetUrl, {
            path: `${savePath}/${subPath}`,
        });

        torrent.once("done", () => {
            terminal.log(chalk.green(`${torrent.name} is done`));

            const toAddTorrent = pending.values().next().value;
            addTorrent(toAddTorrent.magnet, toAddTorrent.subPath);
        });
    } else {
        pending.add({ magnet: magnetUrl, subPath });
    }
}

terminal.timer = setInterval(() => {
    terminal.processUsage();

    const ongoingTorrents = client.torrents.filter(torrent => !torrent.paused && !torrent.done);
    if (ongoingTorrents.length < 1) return;

    for (const torrent of ongoingTorrents) {
        terminal.torrentInfo(torrent);
    }

    terminal.clientInfo({
        active: client.torrents.filter(torrent => !torrent.paused && !torrent.done).length,
        pending: pending.size,
        done: client.torrents.filter(torrent => torrent.done).length,
        total: client.torrents.length,
    });
}, 1000)

export default client;