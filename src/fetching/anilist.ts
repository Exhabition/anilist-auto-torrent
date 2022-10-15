import AniList, { ListEntry } from "anilist-node";

import terminal from "../helper/terminal"

import config from "../config/config";
const { userIds } = config;

const Client = new AniList();

export async function getAnimeFromUser() {
    let allLists = new Set<ListEntry>();

    for (const userId of userIds) {
        terminal.log(`Gettings list of user ${userId}`)

        const lists = await Client.lists.anime(userId).catch(terminal.error);
        if (!lists) return terminal.error("Couldn't fetch lists from AniList, check your connection");

        const planningList = lists.find(list => list.status === "PLANNING");
        if (!planningList?.entries) throw new Error(`Couldn't find planning list for user ${userIds}`);

        const watchingList = lists.find(list => list.status === "CURRENT");
        if (!watchingList?.entries) throw new Error(`Couldn't find watching list for user ${userIds}`);

        allLists = new Set([...watchingList.entries.concat(planningList.entries), ...allLists]);
    }

    return allLists;
} 