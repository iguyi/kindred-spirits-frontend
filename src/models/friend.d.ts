/**
 * 好友数据
 */
export type FriendType = {

    /**
     * 好友 id - 在 Friend 中的 id
     */
    id: number;

    /**
     * 之前是否是当前用户主动加的对方
     */
    isActive: boolean;

    /**
     * 关系状态:
     * 0 - 正常好友
     * 1 - activeUserId 删除了 passiveUserId
     * 2 - passiveUserId 删除了 activeUserId
     * 3 - activeUserId 拉黑 passiveUserId
     * 4 - passiveUserId 拉黑 activeUserId
     * 说明：状态 3 可以变为 状态1; 状态 4 可以变为 状态 3
     */
    relationStatus: number;

    /**
     * 好友信息
     */
    friend: UserType;

    /**
     * 首次成为好友的时间
     */
    createTime: Date;

    /**
     * 最后修改时间
     */
    updateTime: Date;
}
