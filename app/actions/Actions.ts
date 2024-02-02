"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { auth } from '@/auth';
import { RconSocket } from "@/lib/rcon";
import { addBanlist, getBanlist, removeBanlist } from "@/lib/banlist";
import SteamAPI from "@/lib/steam";

export interface ActionResponse {
    message: string;
    ok: boolean;
}

export interface PlayerSummarieResponse {
    steamID: string;
    avatar: string;
    url: string;
    nickname: string;
    countryCode: string | undefined;
    vacBanned?: boolean;
}

/**
 * 获取服务器信息
 *
 * @returns 返回一个Promise对象，包含服务器信息 message:string, ok:boolean
 */
export async function InfoAction(): Promise<ActionResponse> {
    "use server";
    try {
        const result = await clientSendCommand('Info');
        return result;
    }
    catch (e: any) {
        return { message: "error: " + e.message, 'ok': false };
    }
}

/**
 * 显示玩家列表
 *
 * @returns 返回一个Promise对象，包含玩家列表 message:string, ok:boolean
 */
export async function ShowPlayersAction(): Promise<ActionResponse> {
    "use server";
    try {
        const result = await clientSendCommand('ShowPlayers');
        return result;
    }
    catch (e: any) {
        return { message: "error: " + e.message, 'ok': false }
    }
}

/**
 * 向服务器中的所有玩家广播消息
 *
 * @param MessageText 消息内容
 * @returns 返回一个Promise对象，包含消息发送结果 message:string, ok:boolean
 */
export async function BroadcastAction(MessageText: string): Promise<ActionResponse> {
    "use server";
    try {
        const result = await clientSendCommand('Broadcast ' + MessageText);
        return result;
    }
    catch (e: any) {
        return { message: "error: " + e.message, 'ok': false };
    }

}

/**
 * 将玩家临时踢出服务器
 *
 * @param UID PlayerUID 或 SteamID
 * @returns 返回一个Promise对象，包含踢出玩家结果 message:string, ok:boolean
 * 
 */
export async function KickPlayerAction(UID: string): Promise<ActionResponse> {
    "use server";
    try {
        const result = await clientSendCommand('KickPlayer ' + UID);
        return result;
    }
    catch (e: any) {
        return { message: "error: " + e.message, 'ok': false };
    }
}

/**
 * 禁止玩家进入服务器
 *
 * @param UID PlayerUID 或 SteamID
 * @returns 返回一个Promise对象，包含封禁玩家结果 message:string, ok:boolean
 * 
 * 在解禁之前，玩家将无法重新加入服务器。
 * https://nodecraft.com/support/games/palworld/palworld-server-admin-commands
 */
export async function BanPlayerAction(UID: string): Promise<ActionResponse> {
    "use server";
    try {
        const result = await clientSendCommand('BanPlayer ' + UID);
        return result;
    }
    catch (e: any) {
        return { message: "error: " + e.message, 'ok': false };
    }
}


/**
 * 保存游戏存档
 *
 * @returns 返回一个Promise对象，包含保存操作的结果信息
 */
export async function SaveAction(): Promise<ActionResponse> {
    "use server";
    try {
        const result = await clientSendCommand('Save');
        return result;
    }
    catch (e: any) {
        return { message: "error: " + e.message, 'ok': false };
    }
}


/**
 * 使用计时器和消息优雅地关闭服务器，以通知服务器中的玩家。
 *
 * @param Seconds 等待时间（秒）
 * @param MessageText 消息文本
 * @returns 返回一个Promise对象，包含一个message字段，表示操作结果
 */
export async function ShutdownAction(Seconds: number, MessageText: string): Promise<ActionResponse> {
    "use server";
    try {
        const result = await clientSendCommand(`Shutdown ${Seconds} ${MessageText}`);
        return result;
    }
    catch (e: any) {
        return { message: "error: " + e.message, 'ok': false };
    }
}

/**
 * 立即强制关闭服务器
 *
 * @returns 返回一个Promise对象，包含强制关闭服务器操作的结果信息
 */
export async function DoExitAction(): Promise<ActionResponse> {
    "use server";
    try {
        const result = await clientSendCommand('DoExit');
        return result;
    }
    catch (e: any) {
        return { message: "error: " + e.message, 'ok': false };
    }
}

/**
 * 发送RCON命令到指定主机和端口，并返回响应结果
 *
 * @param command 命令字符串
 * @returns 返回响应结果，包含一个message字段和一个ok字段
 */
async function clientSendCommand(command: string): Promise<ActionResponse> {
    const authResult = await CheckAuth();
    if (!authResult.ok) {
        return authResult;
    }

    if (!process.env.RCON_HOST || !process.env.RCON_PORT || !process.env.RCON_PASSWORD) {
        return { "message": "System Enviroment is not configure", 'ok': false };
    }
    const client = new RconSocket(process.env.RCON_HOST, parseInt(process.env.RCON_PORT), process.env.RCON_PASSWORD);
    const result = await client.sendCommand(command);
    await client.close();
    return result;
}

/**
 * 获取玩家Steam信息
 *
 * @param id 玩家SteamID或SteamID数组
 * @returns 返回PlayerSummarieResponse数组
 */
export async function GetPlayerSummaries(id: string | string[]): Promise<PlayerSummarieResponse[]> {
    if (!process.env.STEAM_API_KEY) {
        return [];
    }
    const steam = new SteamAPI(process.env.STEAM_API_KEY);
    let UserSummaryResult = await steam.getPlayerSummarys(id);
    let UserSummarys: PlayerSummarieResponse[] = [];

    UserSummarys = UserSummaryResult.map(item => {
        const tmp_item: PlayerSummarieResponse = {
            steamID: item.steamid,
            avatar: item.avatarmedium,
            url: item.profileurl,
            nickname: item.personaname,
            countryCode: item.loccountrycode,
        }
        return tmp_item;
    })

    let vacBannedResults = await steam.getPlayerBans(id);
    vacBannedResults.forEach(item => {
        const index = UserSummarys.findIndex(element => element.steamID === item.steamID);
        if (index !== -1) {
            UserSummarys[index].vacBanned = item.VACBanned;
        }
    })
    return UserSummarys;
}

/**
 * 验证用户身份的异步函数
 *
 * @param prevState 上一次的状态值，可能为undefined
 * @param formData 表单数据对象
 * @returns 如果验证成功，返回undefined；如果验证失败，返回错误信息字符串
 */
export async function LoginAction(
    prevState: string | undefined,
    formData: FormData,
) {
    "use server";
    try {
        await signIn('credentials', formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
    return undefined;
}

/**
 * 注销功能
 *
 * @returns {Promise<void>}
 */
export async function logout(): Promise<void> {
    "use server";
    return await signOut();
}

/**
 * 获取封禁列表
 *
 * @returns 返回一个Promise，该Promise在成功时返回一个ActionResponse对象，其中包含封禁列表信息
 */
export async function GetBanListAction(): Promise<ActionResponse> {
    "use server";
    let banlist = getBanlist();
    const formattedData = "name,playeruid,steamid\n" +
        banlist.map(item => `${item.username},${item.palPlayerID},${item.steamID}`).join('\n');
    return {
        message: formattedData,
        ok: true
    }
}

/**
 * 将玩家添加到封禁列表中
 *
 * @param steamID 玩家的Steam ID
 * @param palPlayerID 玩家的Pal ID
 * @param username 玩家的用户名
 * @returns Promise<ActionResponse> 添加结果
 */
export async function AddBanListAction(steamID: string, palPlayerID: string, username: string): Promise<ActionResponse> {
    "use server";
    if(addBanlist({steamID, palPlayerID, username})){
        return {
            message: 'Player added to banlist',
            ok:true
        }
    }else{
        return {
            message: 'Player already in banlist',
            ok:false
        }
    }
}

/**
 * 从封禁列表中移除特定 Steam ID 的操作
 *
 * @param steamID 要从封禁列表中移除的 Steam ID
 * @returns 返回一个 Promise，成功时返回一个 ActionResponse 对象，表示操作成功；失败时返回一个 ActionResponse 对象，表示操作失败
 */
export async function RemoveBanListAction(steamID: string): Promise<ActionResponse> {
    "use server";
    if(removeBanlist(steamID)){
        return {
            message: 'Player removed from banlist',
            ok:true
        }
    }else{
        return {
            message: 'Player not in banlist',
            ok:false
        }
    }
}

export async function CheckAuth(): Promise<ActionResponse> {
    const auth_result = await auth();
    if (!auth_result || !auth_result.user) {
        return { 'message': "Web Authentication failed", 'ok': false };
    }
    const expirationDate = new Date(auth_result.expires);
    const currentDate = new Date();

    if (expirationDate < currentDate) {
        return { 'message': "Web Authentication expired", 'ok': false };
    }

    if (!auth_result.user.username || !auth_result.user.isLogedIn) {
        return { 'message': "Web Authentication failed", 'ok': false };
    }
    return { 'message': "Web Authentication success", 'ok': true };
}
