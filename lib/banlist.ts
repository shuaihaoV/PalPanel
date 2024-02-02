import fs from 'fs';

interface BanItemType {
    steamID: string;
    palPlayerID: string;
    username: string;
}

export function getBanlist():BanItemType[]{
    let banlist: BanItemType[] = [];
    if (!fs.existsSync("banlist.json")) {
        try {
            const banlist_json = fs.readFileSync("banlist.json").toString();
            banlist = JSON.parse(banlist_json);
        } catch (e: any) {
            console.log("banlist.json Parse Json format error, Will recreate the file: " + e.message);
            fs.writeFileSync("banlist.json", "[]");
        }
    }
    return banlist;
}

export function addBanlist(banItem: BanItemType): boolean {
    let banlist: BanItemType[] = getBanlist();
    const index = banlist.findIndex(item => item.steamID === banItem.steamID);
    if (index !== -1) {
        return false;
    }
    banlist.push(banItem);
    fs.writeFileSync("banlist.json", JSON.stringify(banlist));
    return true;
}

export function removeBanlist(steamID: string): boolean {
    let banlist: BanItemType[] = getBanlist();
    const index = banlist.findIndex(item => item.steamID === steamID);
    if (index !== -1) {
        banlist.splice(index, 1);
        fs.writeFileSync("banlist.json", JSON.stringify(banlist));
        return true;
    }
    return false;
}