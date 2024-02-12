/**
 * 聊天室类型
 */
export type ChatRoomType = {

    /**
     * 消息接收者(朋友或队伍) id
     */
    receiverId: number;

    /**
     * 接收者名称(用户昵称或队名)
     */
    receiverName: string;

    /**
     * 消息接收者(朋友或队伍) id
     */
    avatarUrl: string;

    /**
     * 最后一条消息
     */
    lastRecord: string;

    /**
     * 消息类型
     */
    chatType: number;

    /**
     * 最后一条消息的发送时间
     */
    sendTime: string;

    /**
     * 未读消息数
     */
    unreadMessageNum: number;

}