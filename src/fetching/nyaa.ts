import { si } from "nyaapi";

import { generateSeasonString } from "../helper/parsing";
import { log } from "../helper/terminal";

import { uploaders, fallbackToAllUploaders } from "../config.json";

export async function searchTorrents(term: string, season?: number, episode?: number) {
    if (season) {
        term = `${term} ${generateSeasonString(season, episode)}`
    }

    // If there are preferred uploaders set, search by uploaders
    for (const uploader of uploaders) {
        log(`Searching ${uploader} for ${term}`);
        const results = await si.searchByUser(uploader, term, 1, {
            category: "1_2",
        });

        if (results.length > 0) return results[0]

        // No results found for this uploader, try next one
    }

    if (fallbackToAllUploaders) {
        log(`Searching all uploaders for ${term}`);
        const results = await si.search(term, 1, {
            category: "1_2",
        });

        if (results.length > 0) return results[0]
    }

    throw new Error(`Couldn't find any torrents called ${term} by ${uploaders.length} preferred uploaders`);
}