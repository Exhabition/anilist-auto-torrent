import WebTorrent from "webtorrent";

import { log, torrentInfo, error } from "../helper/terminal";

import { savePath } from "../config.json"

const client = new WebTorrent();

const MAX_TORRENTS = 4;

client.on("error", (err) => {
    error(err);
})

client.on('torrent', torrent => {
    log(torrent.name);
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
        torrentInfo(torrent);
    }
}, 1000)

export default client;