<template>
  <!-- 顶部 -->
  <van-nav-bar
      v-if="!$route.meta.navBar"
      :title="stats.chatUser.username??$route.meta.title"
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
import {nextTick, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {Toast} from "vant";
import {getCurrentUser} from "../../services/user";

const router = useRouter();
const route = useRoute();

const stats = ref({
  user: {
    id: 0,
    username: "",
    avatarUrl: ''
  },
  chatUser: {
    id: 0,
    username: '',
    avatarUrl: ''
  },
  text: "",
  messages: [],
  content: ''
});

/**
 * WebSocket 连接
 */
let socket = null;

/**
 * 心跳检测间隔时间
 */
const heartbeatInterval = 30 * 1000; // 30秒

/**
 * 心跳计时器
 */
let heartbeatTimer = null;

const chatRoom = ref(null);
onMounted(async () => {
  const {friendId, username, avatarUrl} = route.query;
  stats.value.chatUser.id = Number.parseInt(typeof friendId === "string" ? friendId : "0");
  stats.value.chatUser.username = (typeof username === "string" ? username : null);
  stats.value.chatUser.avatarUrl = (typeof avatarUrl === "string" ? avatarUrl : null);

  let loginUser = await getCurrentUser();
  stats.value.user.id = loginUser.id;
  stats.value.user.username = loginUser.username;
  stats.value.user.avatarUrl = loginUser.avatarUrl;

  init();
});

/**
 * 初始化
 */
const init = () => {
  let uid = stats.value.user?.id;

  if (typeof (WebSocket) == "undefined") {
    Toast.fail("您的浏览器不支持WebSocket");
  } else {
    // let socketUrl = 'ws://' + 'localhost:8080/kindredspirits' + '/websocket/' + uid + '/' + '0';
    let socketUrl = `ws://localhost:8080/kindredspirits/websocket/${uid}/0`;
    if (socket != null) {
      socket.close();
      socket = null;
    }
    // 开启一个websocket服务
    socket = new WebSocket(socketUrl);
    // 打开事件
    socket.onopen = function () {
      startHeartbeat();
    };
    //  浏览器端收消息，获得从服务端发送过来的文本消息
    socket.onmessage = function (msg) {
      if (msg.data === "PONG") {
        return;
      }
      // 对收到的json数据进行解析
      let data = JSON.parse(msg.data);
      createContent(data.receiverUser, null, data.chatContent, null, data.sendTime)
    };
    //关闭事件
    socket.onclose = function () {
      stopHeartbeat();
      setTimeout(init, 5000); // 5秒后重连
    };
    //发生了错误事件
    socket.onerror = function () {
      Toast.fail("发生了错误")
    }
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
  if (stats.value.chatUser.id === 0) {
    return;
  }

  if (stats.value.chatUser.id === stats.value.user.id) {
    Toast.fail("不能给自己发信息");
    return;
  }

  if (!stats.value.text.trim()) {
    Toast.fail("请输入内容");
    return;
  }

  if (typeof (WebSocket) == "undefined") {
    Toast.fail("您的浏览器不支持WebSocket");
    return;
  }

  let message = {
    senderId: stats.value.user.id,
    receiverId: stats.value.chatUser.id,
    chatContent: stats.value.text,
    chatType: 1,
    teamId: 0,
  }

  socket.send(JSON.stringify(message));
  stats.value.messages.push({user: stats.value.user.id, text: stats.value.text});
  createContent(stats.value.user, stats.value.user, stats.value.text, null, new Date());
  stats.value.text = '';
  nextTick(() => {
    const lastElement = chatRoom.value.lastElementChild;
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
 * todo 查看好友信息
 */
const onClickRight = () => {
  // Toast.fail('TODO 查询好友信息');
  Toast.fail(JSON.stringify(stats.value.user));
}

/**
 * 这个方法是用来将 json的聊天消息数据转换成 html的。
 */
const createContent = (remoteUser, nowUser, text, isAdmin, createTime) => {
  // 当前用户消息
  let html;
  if (nowUser) {
    // nowUser 表示是否显示当前用户发送的聊天消息，绿色气泡
    html = `
    <div class="message self">
    <div class="myInfo info">
      <img :alt=${nowUser.username} class="avatar" onclick="showUser(${nowUser.id})" src=${nowUser.avatarUrl}>
    </div>
      <p class="text">${text}</p>
    </div>
`
  } else if (remoteUser) {
    // remoteUser表示远程用户聊天消息，灰色的气泡
    html = `
     <div class="message other">
      <img :alt=${remoteUser.username} class="avatar" onclick="showUser(${remoteUser.id})" src=${remoteUser.avatarUrl}>
      <div class="info">
        <p class="text" >${text}</p>
      </div>
    </div>
`
  }
  // 汇总 html 拼接结果
  stats.value.content += html;
}
</script>

<style scoped>
</style>