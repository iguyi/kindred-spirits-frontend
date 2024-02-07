import {WebSocketType} from "./webSocket";

/**
 * 聊天消息封装
 */
export type ChatMessageType = {

    /**
     * 消息发送者
     */
    senderUser: WebSocketType;

    /**
     * 消息接收者
     */
    receiverUser: WebSocketType;

    /**
     * 接收消息的队伍的 id
     */
    teamId: number;

    /**
     * 聊天内容
     */
    chatContent: string;

    /**
     * 消息类型
     */
    chatType: number;

    /**
     * 错误响应标识
     */
    errorFlag: boolean;

    /**
     * 消息发送时间
     */
    sendTime: string;

}