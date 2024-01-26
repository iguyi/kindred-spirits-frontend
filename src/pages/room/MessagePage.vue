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
            <van-button size="mini" type="success">同意</van-button>
            <van-button size="mini" type="danger">拒绝</van-button>
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

const router = useRouter();
const route = useRoute();

const messageList = ref([]);

onMounted(async () => {
  const messageListData = await myAxios.get("/message/list", {});
  if (messageListData && messageListData.data.code === 0) {
    messageList.value = messageListData.data.data;
  }
});

/**
 * 回退
 */
const onClickLeft = () => {
  router.back();
}
</script>

<style scoped>

</style>