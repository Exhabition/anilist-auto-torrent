import WebTorrent from "webtorrent";

import terminal from "../helper/terminal";

import config from "../config/config"
const { savePath, maxActiveTorrents } = config;

const client = new WebTorrent();

client.on("error", (err) => {
    terminal.error(err);
})

client.on('torrent', torrent => {
    terminal.log(torrent.name);
});

export function addTorrent(magnetUrl: string) {
    const torrent = client.add(magnetUrl, {
        path: savePath,
    })

    const activeTorrents = client.torrents.filter(torrent => !torrent.paused);
    if (activeTorrents.length > maxActiveTorrents) torrent.pause();
}

terminal.timer = setInterval(() => {
    terminal.processUsage();

    const ongoingTorrents = client.torrents.filter(torrent => !torrent.paused && !torrent.done);
    if (ongoingTorrents.length < 1) return;

    // Some torrents finished, let's start new ones
    const inactiveTorrents = client.torrents.filter(torrent => torrent.paused && !torrent.done);
    if (ongoingTorrents.length < maxActiveTorrents && inactiveTorrents.length > 0) {
        terminal.log(`Resuming ${inactiveTorrents[0].length}`);
        inactiveTorrents[0].resume();
    }

    for (const torrent of ongoingTorrents) {
        terminal.torrentInfo(torrent);
    }

    terminal.clientInfo({
        active: client.torrents.filter(torrent => !torrent.paused && !torrent.done).length,
        pending: client.torrents.filter(torrent => torrent.paused && !torrent.done).length,
        done: client.torrents.filter(torrent => torrent.done).length,
        total: client.torrents.length,
    });
}, 1000)

export default client;