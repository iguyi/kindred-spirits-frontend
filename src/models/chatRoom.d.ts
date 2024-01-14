/**
 * 聊天室类型
 */
export type ChatRoomType = {

    /**
     * 消息接收者(朋友或队伍) id
     */
    receiverId: number;

    /**
     * 消息接收者(朋友或队伍) id
     */
    avatarUtl: string;

    /**
     * 最后一条消息
     */
    lastRecord: string;

    /**
     * todo 定义枚举
     * 消息类型
     */
    chatType: number;

    /**
     * 最后一条消息的发送时间
     */
    sendTime: string;

}