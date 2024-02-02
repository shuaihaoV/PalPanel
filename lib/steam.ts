/** Persona states as indicated by https://developer.valvesoftware.com/wiki/Steam_Web_API#Public_Data */

interface PlayerSummary {
    steamid: string;
    personaname: string;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
    personastate: number;
    communityvisibilitystate: number;
    profilestate?: number;
    lastlogoff?: number;
    commentpermission?: number;
    realname?: string;
    primaryclanid?: string;
    timecreated?: number;
    gameid?: string;
    gameserverip?: string;
    gameextrainfo?: string;
    cityid?: number;
    loccountrycode?: string;
    locstatecode?: string;
    loccityid?: number;
}

interface GetPlayerSummariesResponse {
    response: {
        players: PlayerSummary[];
    };
}


interface PlayerBan {
    steamID: string;
    /** Is this user community banned */
    CommunityBanned: boolean;
    /** Is this user vac banned */
    VACBanned: boolean;
    /** Number of VAC bans the user has had */
    NumberOfVACBans: number;
    /** Number of game bans the user has had */
    NumberOfGameBans: number;
    /**
     * Economy ban status of the user. 'none' means no economy ban.
     * 'probation' means user is on probation.
     * Not sure what other string values exist
     */
    EconomyBan: string;
    /** The number of days it has been since the user's last ban */
    DaysSinceLastBan: number;
}

interface GetPlayerBansResponse {
    players: PlayerBan[];
}

export default class SteamAPI {
    private key: string;
    constructor(key: string) {
        this.key = key;
    }
    public async getPlayerSummarys(id: string | string[]): Promise<PlayerSummary[]> {
        let url = "";
        if (typeof id === 'string') {
            url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.key}&steamids=${id}`;
        } else {
            url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.key}&steamids=${id.join(',')}`;
        }
        try{
            const result = await fetch(url);
            const result_json = await result.json() as GetPlayerSummariesResponse;
            return result_json.response.players;
        }catch(e){
            console.error(e);
            return [];
        }
    }

    public async getPlayerBans(id: string | string[]): Promise<PlayerBan[]> {
        let url = "";
        if (typeof id === 'string') {
            url = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${this.key}&steamids=${id}`;
        } else {
            url = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${this.key}&steamids=${id.join(',')}`;
        }
        try{
            const result = await fetch(url);
            const result_json = await result.json() as GetPlayerBansResponse;
            return result_json.players;
        }catch(e){
            console.error(e);
            return [];
        }
    }
}