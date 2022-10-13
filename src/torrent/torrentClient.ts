import WebTorrent from "webtorrent";

import terminal from "../helper/terminal";

import { savePath } from "../config.json"

const client = new WebTorrent();

const MAX_TORRENTS = 4;

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
    if (activeTorrents.length > MAX_TORRENTS) torrent.pause();
}

setInterval(() => {
    const ongoingTorrents = client.torrents.filter(torrent => !torrent.paused);
    if (ongoingTorrents.length < 1) return;

    for (const torrent of ongoingTorrents) {
        terminal.torrentInfo(torrent);
    }
}, 1000)

export default client;