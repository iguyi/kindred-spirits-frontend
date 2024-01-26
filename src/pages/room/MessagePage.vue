<template>
  <!-- 顶部 -->
  <van-nav-bar
      v-if="!$route.meta.navBar"
      :title="$route.meta.title"
      left-arrow
      @click-left="onClickLeft"
      class="custom-navbar"
  >
    <template #left>
      <van-icon name="arrow-left" size="18"/>
    </template>
  </van-nav-bar>

  <van-cell-group>
    <van-cell v-for="message in messageList" center>
      <template #title>
        <div v-if="message.messageType === 0">系统消息</div>
        <div v-if="message.messageType === 1">验证消息</div>
      </template>
      <template #right-icon>
        <div v-if="message.messageType === 1">
          <div v-if="message.processed === 0">
            <van-button
                @click="processFriendApply(message.senderId, message.receiverId, true)"
                size="mini"
                type="success">
              同意
            </van-button>
            <van-button
                @click="processFriendApply(message.senderId, message.receiverId, false)"
                size="mini"
                type="danger"
            >
              拒绝
            </van-button>
          </div>
          <div v-if="message.processed === 1">已处理</div>
        </div>
      </template>
      <template #label>
        <div v-if="message.messageType === 0">{{ `${message.messageBody}` }}</div>
        <div v-if="message.messageType === 1">{{ `来自用户 "${message.sendName}" 的 ${message.messageBody}` }}</div>
      </template>
    </van-cell>
  </van-cell-group>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../../plugins/myAxios";
import {Toast} from "vant";

const router = useRouter();
const route = useRoute();

const messageList = ref([]);

onMounted(async () => {
  // 获取消息列表
  await getMessageList();
  // 刷新系统消息的状态
  await myAxios.get("/message/refresh", {});
});

/**
 * 获取消息列表
 */
const getMessageList = async () => {
  const messageListData = await myAxios.get("/message/list", {});
  if (messageListData && messageListData.data.code === 0) {
    messageList.value = messageListData.data.data;
  }
}

/**
 * 处理好友申请
 *
 * @param senderId - 发送好友申请者的 id
 * @param receiverId - 被好友申请者, 就是自己
 * @param isAgreed - 是否同意
 */
const processFriendApply = async (senderId: number, receiverId: number, isAgreed: boolean) => {
  const res = await myAxios.post("/friend/process/apply", {
    senderId: senderId,
    isAgreed: isAgreed
  });

  if (res && res.data.code === 0 && res.data.data === true) {
    Toast.success("操作成功");
    messageList.value.forEach(message => {
      if (message.senderId === senderId && message.receiverId === receiverId) {
        message.processed = 1;
      }
    });
    //await getMessageList();
    return;
  }

  Toast.fail(res.data.description);
}

/**
 * 回退
 */
const onClickLeft = () => {
  router.back();
}
</script>

<style scoped>

</style>