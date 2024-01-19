import {UserType} from "./user";

/**
 * 队伍类型
 */
export type TeamType = {
    id: number;
    name: string;
    description: string;
    maxNum: number;
    status: number;
    createUser?: UserType;
    leaderUser?: UserType;
    expireTime?: Date;
    createTime: Date;
    updateTime: Date;
    hasJoin: boolean;
}
