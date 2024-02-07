<template>
  <!-- 顶部 -->
  <van-nav-bar
      v-if="!$route.meta.navBar"
      :title="roomMeta.name"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
      class="custom-navbar"
  >
    <template #left>
      <van-icon name="arrow-left" size="18"/>
    </template>
    <template #right v-if="roomMeta.teamId !== 0">
      <van-icon name="contact" size="18"/>
    </template>
    <template #right v-if="roomMeta.teamId === 0">
      <van-icon name="contact" size="18"/>
    </template>
  </van-nav-bar>

  <div class="chat-container">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <div class="content" ref="chatRoom">
        <div
            v-for="item in messages"
            :class="item.senderUser.id === currentUser.id ? 'message self' : 'message other'"
        >
          <!-- 头像 -->
          <div v-if="item.senderUser.id === currentUser.id" class="myInfo info">
            <img :alt="item.senderUser.username" class="avatar" :src="item.senderUser.avatarUrl">
          </div>
          <img
              v-if="item.senderUser.id !== currentUser.id"
              class="avatar"
              :src="item.senderUser.avatarUrl"
              :alt="item.senderUser.username"
          />

          <!-- 昵称、消息 -->
          <div v-if="item.senderUser.id === currentUser.id">
            <div class="username">{{ item.senderUser.username }}</div>
            <p class="text">{{ item.chatContent }}</p>
          </div>
          <div v-if="item.senderUser.id !== currentUser.id" class="info">
            <span class="username">{{ item.senderUser.username }}</span>
            <p class="text">{{ item.chatContent }}</p>
          </div>
        </div>
      </div>
    </van-pull-refresh>

    <!-- 输入 -->
    <van-cell-group inset style="position: fixed;bottom: 0;width: 100%">
      <van-field
          v-model="text"
          center
          clearable
          placeholder="请输入..."
      >
        <template #button>
          <van-button size="small" type="primary" @click="send" style="margin-right: 16px">发送</van-button>
        </template>
      </van-field>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onMounted, ref} from "vue";
import {ChatMessageType} from "../../models/chatMessage";
import {useRoute, useRouter} from "vue-router";
import {UserType} from "../../models/user";
import {getCurrentUser} from "../../services/user";
import {webSocketCache} from "../../states/chat";
import {Toast} from "vant";
import myAxios from "../../plugins/myAxios";

// 路由
const router = useRouter();
const route = useRoute();

// 组件状态
const refreshing = ref(false);  // 下拉刷新状态

// 页面数据
const text = ref('');  // 输入框内容
const messages = ref<ChatMessageType[]>([]);  // 消息列表
const chatRoom = ref(null);  // 聊天窗口中的最后一个元素
const currentUser = ref<UserType>(null);
const roomMeta = ref({
  name: '',
  teamId: 0,
  isTeamChat: false
});

// 聊天功能
const heartbeatInterval = ref(30 * 1000);  // 心跳检测间隔时间, 单位: s
const heartbeatTimer = ref(null);  // 心跳计时器
let socket = null;  // WebSocket 连接

onMounted(async () => {
  // 获取当前登录用户消息
  currentUser.value = await getCurrentUser();

  // 获取聊天室信息
  const {name, teamId} = route.query;
  roomMeta.value.name = typeof name === 'string' ? name : '';
  roomMeta.value.teamId = Number.parseInt(typeof teamId === 'string' ? teamId : '0');

  if (roomMeta.value.teamId === 0) {
    // 私聊
    roomMeta.value.isTeamChat = false;

  } else if (roomMeta.value.teamId !== 0) {
    // 队伍聊天
    roomMeta.value.isTeamChat = true;
    const teamMessageData = await myAxios.post("/chat/team", {
      teamId: roomMeta.value.teamId
    });
    messages.value = teamMessageData.data.data;
  } else {
    alert("参数错误");
    await router.replace("/");
    return;
  }

  init();

  // 重载页面
  scrollToBottom();
});

/**
 * 查看队伍信息
 */
const onClickRight = () => {
  if (roomMeta.value.isTeamChat) {
    // 查看队伍聊天室的消息
    router.push({
      path: '/team/home',
      query: {
        "teamId": roomMeta.value.teamId,
      }
    });
  } else {
    // 查看私聊对象的消息
    Toast.fail('todo');
  }
}

/**
 * 初始化 WebSocket 连接
 */
const init = () => {
  let currentUserId = currentUser.value.id;
  let teamId = roomMeta.value.teamId;
  let socketUrl = `ws://localhost:8080/kindredspirits/websocket/${currentUserId}/${teamId}`;

  if (teamId !== 0) {
    // 初始化队伍聊天连接
    // 构建队伍聊天连接的标识
    let socketKey = `${currentUserId}-${teamId}`;

    // 拉取已有的队伍聊天连接
    let teamChatMap = webSocketCache.teamChatMap;
    if (teamChatMap.hasOwnProperty(socketKey) && teamChatMap[socketKey].readyState === 1) {
      // 当前初始化的队伍聊天连接已存在
      socket = teamChatMap[socketKey];
    }

    // 创建队伍聊天连接并初始化
    socket = new WebSocket(socketUrl);
    teamChatMap[socketKey] = socket;

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

      if (data.errorFlag) {
        Toast.fail(data.chatContent);
        return;
      }

      // 保存接收到的消息
      messages.value.push(data);

      // 重载数据
      scrollToBottom();
    };

    // 设置 WebSocket 关闭时执行的动作
    socket.onclose = function () {
      stopHeartbeat();
    };

    // 设置 WebSocket 发生错误事件时执行的动作
    socket.onerror = function () {
      Toast.fail("发生了错误");
    }
  }
}

/**
 * 发送消息
 */
const send = () => {
  if (!text.value.trim()) {
    Toast.fail("请输入内容");
    return;
  }

  if (typeof (WebSocket) == "undefined") {
    Toast.fail("您的浏览器不支持 WebSocket");
    return;
  }

  let teamId = roomMeta.value.teamId;
  let chatType: number = teamId === 0 ? 1 : 2

  // 发送消息
  let message = {
    senderId: currentUser.value.id,
    teamId: teamId,
    chatContent: text.value,
    chatType: chatType,
  }
  socket.send(JSON.stringify(message));

  // 保存数据
  let chatMessage: ChatMessageType = {
    chatContent: text.value,
    chatType: chatType,
    errorFlag: false,
    receiverUser: null,
    sendTime: "日期", // todo 日期
    senderUser: {
      id: currentUser.value.id,
      userAccount: currentUser.value.userAccount,
      username: currentUser.value.username,
      avatarUrl: currentUser.value.avatarUrl
    },
    teamId: 0
  }
  messages.value.push(chatMessage);

  // 情况输入框
  text.value = '';

  // 重载页面
  scrollToBottom();
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


// 将内容滚动到最后一个元素
const scrollToBottom = () => {
  nextTick(() => {
    if (chatRoom.value) {
      chatRoom.value.lastElementChild.scrollIntoView();
    }
  });
};

// 返回上一个页面
const onClickLeft = () => {
  router.back();
}

// 下拉刷新
const onRefresh = async () => {
  Toast.fail('没有更多记录了');
  refreshing.value = false;
};
</script>

<style scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.message {
  display: flex;
  align-items: center;
  margin: 10px 10px;
}

.content {
  padding-top: 0;
  padding-bottom: 0;
  display: flex;
  flex-direction: column
}

.avatar {
  align-self: flex-start;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-right: 10px;
  margin-left: 10px;
}

.username {
  align-self: flex-start;
  text-align: center;
  max-width: 200px;
  font-size: 12px;
  color: #999;
  padding-bottom: 4px;
  white-space: nowrap;
  overflow: visible;
  background-color: #fff;
}

.info {
  display: flex;
  flex-direction: column;
  order: 2;
}

.myInfo {
  align-self: flex-start;
}

.text {
  margin-top: 5px;
  padding: 10px;
  border-radius: 10px;
  background-color: #eee;
  word-wrap: break-word;
  word-break: break-all;
}

.other .text {
  align-self: flex-start;
}

.self {
  display: flex;
  align-items: flex-start;
}

.self .avatar {
  align-self: flex-start; /* 将.avatar内容放置在最右侧的上方 */
  margin-left: auto; /* 将.avatar内容放置在最右侧 */
}

.self .text {
  align-self: flex-end; /* 将文本内容放置在.avatar的下方 */
  order: -1; /* 通过order属性调整显示顺序 */
}

.self .username {
  max-width: 300px;
  font-size: 12px;
  text-align: right; /* 文本右对齐 */
  align-self: flex-start; /* 将用户名内容放置在.avatar的上方并且向右对齐 */
  margin-right: 10px; /* 与.avatar之间的间距 */
  order: 1; /* 通过order属性调整显示顺序 */
  overflow: visible;
}
</style>