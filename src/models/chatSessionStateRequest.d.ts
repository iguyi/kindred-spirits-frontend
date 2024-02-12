/**
 * 设置会话状态请求参数封装
 */
export type ChatSessionStateRequest = {

    /**
     * 好友或队伍 id
     */
    id: number;

    /**
     * 聊天会话类型
     */
    chatType: number;

    /**
     * 聊天会话状态, 聊天会话打开表示用户正在对应聊天窗口内
     * - true: 聊天会话打开
     * - false: 聊天会话关闭
     */
    state: boolean;

}