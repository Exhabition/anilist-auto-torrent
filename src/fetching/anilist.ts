import AniList from "anilist-node";

import terminal from "../helper/terminal"

import { userId } from "../config.json"

const Client = new AniList();

export async function getAnimeFromUser() {
    const lists = await Client.lists.anime(userId).catch(terminal.error);
    if (!lists) return terminal.error("Couldn't fetch lists from AniList, check your connection");

    const planningList = lists.find(list => list.status === "PLANNING");
    if (!planningList?.entries) throw new Error(`Couldn't find planning list for user ${userId}`);

    const watchingList = lists.find(list => list.status === "CURRENT");
    if (!watchingList?.entries) throw new Error(`Couldn't find watching list for user ${userId}`);

    return watchingList.entries.concat(planningList.entries);
} 