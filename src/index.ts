import * as dotenv from "dotenv"
dotenv.config();

import chalk from "chalk";

import config from "./config/config";

import { searchTorrents } from "./fetching/nyaa";
import { getAnimeFromUser } from "./fetching/anilist";

import { isInPast } from "./helper/date";
import { getSeasonFromTitle } from "./helper/parsing";
import terminal from "./helper/terminal";

import { addTorrent } from "./torrent/torrentClient"

(async () => {
    for (const [key, value] of Object.entries(config)) {
        terminal.log(`[${key}] ${value}`);
    }

    const savedTorrents = [];
    const entriesFailed = [];

    const planningList = await getAnimeFromUser();
    if (!planningList) process.exit(1);

    for (const plannedAnime of planningList) {
        const title = plannedAnime.media.title.english;
        if (!title) {
            terminal.log(`Skipping ${plannedAnime.media.id} because it has no english title`);
            continue
        }

        const isFullyReleased = isInPast(plannedAnime.media.endDate as any);
        const { cleanTitle, season } = getSeasonFromTitle(title);
        const episode = isFullyReleased ? null : 1 // TODO get latest ep

        const result = await searchTorrents(cleanTitle, season, episode).catch(terminal.error);
        if (!result) {
            entriesFailed.push(cleanTitle)
            continue;
        }

        terminal.log(`[${chalk.green("+")}] Adding ${result.name}`);
        const subPath = plannedAnime.media.format === "TV" || plannedAnime.media.format === "TV" ? "Series" : "Movies";
        const torrent = addTorrent(result.magnet, subPath);
        savedTorrents.push(torrent)
    }
})()