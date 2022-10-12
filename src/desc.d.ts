type NyaaResult = {
    id: string;
    name: string;
    hash: string;
    date: string;
    filesize: string;
    category: string;
    sub_category: string;
    magnet: string;
    torrent: string;
    seeders: string;
    leecher: string;
    completed: string;
    status: string;
}

declare module "nyaapi" {
    export const si = {
        searchByUser(user: string, term: string, n: number, {
            category: string
        }): Promise<NyaaResult[]>;,

        search(term: string, n: number, {
            category: string,
        }): Promise<NyaaResult[]>;
    }
}