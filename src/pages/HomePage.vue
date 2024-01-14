<template>
  <HistoryRoomCardList :chat-room-list="historyChatRoomList"/>
</template>

<script setup>
import HistoryRoomCardList from "../components/HistoryRoomCardList.vue";
import {onMounted, ref} from "vue";
import myAxios from "../plugins/myAxios";

const historyChatRoomList = ref([]);

onMounted(async () => {
  // 获取历史会话
  const historyChatRoomListData = await myAxios.get("/chat/room/list", {});
  historyChatRoomList.value = historyChatRoomListData.data.data;
});

</script>

<style scoped>
</style>