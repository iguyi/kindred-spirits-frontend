<template>
  <van-cell
      is-link
      to="/room/message"
      icon="envelop-o"
      center
  >
    <template #icon>
      <van-icon name="envelop-o" size="23px" style="margin-left: 5px"/>
    </template>
    <template #right-icon v-if="undressedNum !== 0">
      <van-icon :badge="undressedNum" size="23px" style="margin-right: 25px"/>
    </template>
    <template #title>
      <div style="font-weight: bold; font-size: 16px; margin-left: 5px">
        消息通知
      </div>
    </template>

  </van-cell>

  <HistoryRoomCardList :chat-room-list="historyChatRoomList"/>
</template>

<script setup lang="ts">
import HistoryRoomCardList from "../components/HistoryRoomCardList.vue";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/myAxios";
import {useRoute, useRouter} from "vue-router";
import backendUrl from "../config/url.js";
import {getCurrentUser} from "../services/user.js";
import {UserType} from "../models/user";
import {webSocketCache} from "../states/chat";
import {ChatMessageType} from "../models/chatMessage";
import {Toast} from "vant";
import {ChatRoomType} from "../models/chatRoom";


const router = useRouter();
const route = useRoute();

// 历史会话列表
const historyChatRoomList = ref<ChatRoomType[]>([]);

// 未处理的消息数
const undressedNum = ref(0);
const currentUser = ref<UserType>(null);

// 聊天功能
const heartbeatInterval = ref(30 * 1000);  // 心跳检测间隔时间, 单位: ms
const heartbeatTimer = ref(null);  // 心跳计时器
const unreadNumInterval = ref(10 * 1000);
const unreadNumTimer = ref()
let socket = null;  // WebSocket 连接

onMounted(async () => {
  let params = route.query;
  if (params !== {}) {
    if (params.isLogin) {
      await router.push({
        path: '/user/login',
        query: {
          redirect: params.redirect
        }
      });
      return;
    }
  }

  // 获取当前登录用户消息
  currentUser.value = await getCurrentUser();

  // 获取历史会话
  const historyChatRoomListData = await myAxios.get("/chat/room/list", {});
  historyChatRoomList.value = historyChatRoomListData.data.data;

  // 获取未读消息数
  const messageListData = await myAxios.get("/message/undressed", {});
  let num = messageListData.data.data;
  undressedNum.value = num >= 99 ? '99+' : num;

  // 初始化 WebSocket 以实时显示未读消息数
  init();

  // 定时询问未读消息数
  unreadNumTimer.value = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send("unread");
    }
  }, unreadNumInterval.value);
});

/**
 * 初始化 WebSocket 连接, 用于实时获取未读消息数
 */
const init = () => {
  let currentUserId = currentUser.value.id;
  let socketUrl = `ws://${backendUrl}/websocket/${currentUserId}/0`;

  // 初始化私聊连接
  // 如果用于私聊的 WebSocket 已经存在且是打开状态, 直接使用
  socket = webSocketCache.privateChat;
  if (socket == null || socket.readyState !== 1) {
    // 创建私聊连接并初始化
    socket = new WebSocket(socketUrl);
    webSocketCache.privateChat = socket;
  }

  // WebSocket 打开时的回调函数
  socket.onopen = function () {
    startHeartbeat(socket);
  };

  // 接收到消息时的回调函数
  socket.onmessage = function (msg) {
    // 解析接收到的消息
    let data: ChatMessageType = JSON.parse(msg.data);

    // 心跳检查
    if (data.chatContent === "PONG") {
      return;
    }

    // 发送消息出错
    if (data.errorFlag) {
      Toast.fail(data.chatContent);
      return;
    }

    // 更新未读消息数
    historyChatRoomList.value = JSON.parse(data.chatContent);
  }

  // 设置 WebSocket 关闭时执行的动作
  socket.onclose = function () {
    stopHeartbeat();
  }

  // 设置 WebSocket 发生错误事件时执行的动作
  socket.onerror = function () {
    Toast.fail("发生了错误");
  }
}

/**
 * 开启 WebSocket 心跳检测
 */
const startHeartbeat = (socket) => {
  heartbeatTimer.value = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send("PING");
    }
  }, heartbeatInterval.value);
}

/**
 * 停止心跳检测
 */
const stopHeartbeat = () => {
  clearInterval(heartbeatTimer);
  heartbeatTimer.value = null;
}

</script>

<style scoped>
</style>