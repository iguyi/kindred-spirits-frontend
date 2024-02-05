<template>
  <!-- 顶部 -->
  <van-nav-bar
      v-if="!$route.meta.navBar"
      :title="stats.team.teamName??$route.meta.title"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
      class="custom-navbar"
  >
    <template #left>
      <van-icon name="arrow-left" size="18"/>
    </template>
    <template #right>
      <van-icon name="contact" size="18"/>
    </template>
  </van-nav-bar>

  <div class="chat-container">
    <div class="content" ref="chatRoom" v-html="stats.content"></div>
    <van-cell-group inset style="position: fixed;bottom: 0;width: 100%">
      <van-field
          v-model="stats.text"
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
import {useRoute, useRouter} from "vue-router";
import {nextTick, onMounted, ref} from "vue";
import myAxios from "../../plugins/myAxios";
import {Toast} from "vant";
import {getCurrentUser} from "../../services/user";
import {webSocketCache} from "../../states/chat";

const router = useRouter();
const route = useRoute();

// 聊天室数据
const stats = ref({
  // 当前登录用户
  user: {
    id: 0,
    username: "",
    avatarUrl: ''
  },

  users: [],  // 队伍成员列表

  // 队伍信息
  team: {
    teamId: 0,
    teamName: ''
  },

  text: "",  // 输入框内容
  messages: [],  // 存储消息, 不发给后端
  content: ''  // html 拼接结果
});

/**
 * WebSocket 连接
 */
let socket = null;

/**
 * 心跳检测间隔时间
 */
const heartbeatInterval = 30 * 1000;

/**
 * 心跳计时器
 */
let heartbeatTimer = null;

/**
 * 存储 <div class="content" ref="chatRoom" v-html="stats.content"></div> 内的最后一个子元素
 */
const chatRoom = ref(null);

onMounted(async () => {
  // 获取队伍信息
  const {teamId, teamName} = route.query;
  stats.value.team.teamId = Number.parseInt(typeof teamId === "string" ? teamId : "0");
  stats.value.team.teamName = typeof teamName === "string" ? teamName : '';

  // 获取当前登录用户消息
  let loginUser = await getCurrentUser();
  stats.value.user.id = loginUser.id;
  stats.value.user.username = loginUser.username;
  stats.value.user.avatarUrl = loginUser.avatarUrl;

  // 发送请求到 "/chat/team", 获取历史聊天消息
  const teamMessage = await myAxios.post("/chat/team", {
    teamId: stats.value.team.teamId
  });

  // 遍历显示历史消息
  teamMessage.data.data.forEach(chat => {
    // 拿到消息发送者消息
    let senderUser = chat.senderUser;
    if (senderUser.id === stats.value.user.id) {
      // 我发出的消息
      createContent(null, senderUser, chat.chatContent);
    } else {
      // 朋友发出的消息
      createContent(senderUser, null, chat.chatContent);
    }
  });

  // 初始化 WebSocket 连接
  init();

  // 重载数据
  await nextTick();

  // 获取 <div class="content" ref="chatRoom" v-html="stats.content"></div> 内的最后一个子元素
  let value = chatRoom.value;
  const lastElement = value.lastElementChild;
  lastElement.scrollIntoView();
});

/**
 * 初始化
 */
const init = () => {
  // 当前登录用户 id
  let uid = stats.value.user?.id;

  if (typeof (WebSocket) == "undefined") {
    Toast.fail("您的浏览器不支持 WebSocket");
    return;
  }

  // 根据 socketUrl 开启一个新的 WebSocket 服务
  let socketKey = `${uid}-${stats.value.team.teamId}`
  if (webSocketCache.teamChatMap.hasOwnProperty(socketKey) && webSocketCache.teamChatMap[socketKey].readyState === 1) {
    socket = webSocketCache.teamChatMap[socketKey];
    return;
  }

  // todo 上线
  let socketUrl = `ws://localhost:8080/kindredspirits/websocket/${uid}/${stats.value.team.teamId}`;

  socket = new WebSocket(socketUrl);
  webSocketCache.teamChatMap[socketKey] = socket;

  // 打开事件
  socket.onopen = function () {
    startHeartbeat();
  };

  // 设置 WebSocket 打开时执行的动作
  socket.onmessage = function (msg) {
    // 心跳检查
    if (msg.data === "PONG") {
      return;
    }

    // 对收到的json数据进行解析
    let data = JSON.parse(msg.data);

    // 保存消息到聊天室数据中
    stats.value.messages.push(data);

    // 构建消息内容
    createContent(data.senderUser, null, data.chatContent);

    // 重载数据
    nextTick(() => {
      let value = chatRoom.value;
      if (value === null) {
        location.reload();
        return;
      }
      const lastElement = value.lastElementChild;
      lastElement.scrollIntoView();
    });
  };

  // 设置 WebSocket 关闭时执行的动作
  socket.onclose = function () {
    stopHeartbeat();
    // setTimeout(init, 5000); // 5秒后重连
  };

  // 设置 WebSocket 发生错误事件时执行的动作
  socket.onerror = function () {
    Toast.fail("发生了错误")
  }
}

/**
 * 开启 WebSocket 心跳检测
 */
const startHeartbeat = () => {
  heartbeatTimer = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send("PING");
    }
  }, heartbeatInterval);
}

/**
 * 停止心跳检测
 */
const stopHeartbeat = () => {
  clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

/**
 * 发送消息
 */
const send = () => {
  if (stats.value.team.teamId === 0) {
    return;
  }

  if (!stats.value.text.trim()) {
    Toast.fail("请输入内容");
    return;
  }

  if (typeof (WebSocket) == "undefined") {
    Toast.fail("您的浏览器不支持 WebSocket");
    return;
  }

  let message = {
    senderId: stats.value.user.id,
    teamId: stats.value.team.teamId,
    chatContent: stats.value.text,
    chatType: 2,
  }

  socket.send(JSON.stringify(message));
  stats.value.messages.push({user: stats.value.user.id, text: stats.value.text});
  createContent(null, stats.value.user, stats.value.text);
  stats.value.text = '';
  nextTick(() => {
    let value = chatRoom.value;
    const lastElement = value.lastElementChild;
    lastElement.scrollIntoView();
  });
}

/**
 * 回退
 */
const onClickLeft = () => {
  router.back();
}

/**
 * 查看队伍信息
 */
const onClickRight = () => {
  router.push({
    path: '/team/home',
    query: {
      "teamId": stats.value.team.teamId,
    }
  });
}

/**
 * 这个方法是用来将 json的聊天消息数据转换成 html的。
 *
 * @param otherUser     - 队员
 * @param currentUser   - 自己
 * @param text - 消息
 */
const createContent = (otherUser, currentUser, text) => {
  // 当前用户消息
  let html;
  if (currentUser) {
    // nowUser 表示是否显示当前用户发送的聊天消息，绿色气泡
    html = `
      <div class="message self">
        <div class="myInfo info">
            <img :alt=${currentUser.username} class="avatar" src=${currentUser.avatarUrl}>
        </div>
        <p class="text">${text}</p>
      </div>
    `
  } else if (otherUser) {
    // remoteUser表示远程用户聊天消息，灰色的气泡
    html = `
      <div class="message other">
        <img :alt=${otherUser.username} class="avatar" src=${otherUser.avatarUrl}>
        <div class="info">
          <span class="username">${otherUser.username}</span>
          <p class="text" >${text}</p>
        </div>
      </div>
    `
  } else {
    console.log("数据错误");
  }

  // 汇总 html 拼接结果
  stats.value.content += html;
}

</script>

<style scoped>

</style>