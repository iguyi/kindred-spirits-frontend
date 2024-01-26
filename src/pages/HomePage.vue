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

<script setup>
import HistoryRoomCardList from "../components/HistoryRoomCardList.vue";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/myAxios";

// 历史会话列表
const historyChatRoomList = ref([]);

// 未处理的消息数
const undressedNum = ref(0);

onMounted(async () => {
  // 获取历史会话
  const historyChatRoomListData = await myAxios.get("/chat/room/list", {});
  historyChatRoomList.value = historyChatRoomListData.data.data;

  // 获取未读消息数
  const messageListData = await myAxios.get("/message/undressed", {});
  let num = messageListData.data.data;
  undressedNum.value = num >= 99 ? '99+' : num;
});

</script>

<style scoped>
</style>