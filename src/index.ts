import chalk from "chalk";

import { searchTorrents } from "./fetching/nyaa";
import { getAnimeFromUser } from "./fetching/anilist";

import { isInPast } from "./helper/date";
import { getSeasonFromTitle } from "./helper/parsing";
import { initTerminal, log, error } from "./helper/terminal";

import TorrentClient, { addTorrent } from "./torrent/torrentClient"

initTerminal();

(async () => {
    const savedTorrents = [];
    const entriesFailed = [];

    const planningList = await getAnimeFromUser();
    for (const plannedAnime of planningList) {
        const title = plannedAnime.media.title.english;
        if (!title) {
            log(`Skipping ${plannedAnime.media.id} because it has no english title`);
            continue
        }

        const isFullyReleased = isInPast(plannedAnime.media.endDate as any);
        const { cleanTitle, season } = getSeasonFromTitle(title);
        const episode = isFullyReleased ? null : 1 // TODO get latest ep

        const result = await searchTorrents(cleanTitle, season, episode).catch(error);
        if (!result) {
            entriesFailed.push(cleanTitle)
            continue;
        }

        log(`[${chalk.green("+")}] Adding ${result.name}`);
        const torrent = addTorrent(result.magnet);
        savedTorrents.push(torrent)
    }
})()