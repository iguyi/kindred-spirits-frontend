<template>
  <van-cell
      @click="click"
      v-for="chatRoom in chatRoomList"
      is-link
  >
    <template #right-icon></template>

    <!--  添加好友  -->
    <template #extra class="sendTime"> {{chatRoom.sendTime}} </template>

    <template #default>
      <div class="custom-cell">
        <!-- 头像 -->
        <div>
          <van-image
              round
              width="40px"
              height="40px"
              :src="chatRoom.avatarUrl"
          />
        </div>

        <!-- 用户信息 -->
        <div style="margin-left: 5px">
          <span class="custom-title">{{chatRoom.receiverName}}</span><br>
          <span>{{chatRoom.lastRecord}}</span>
        </div>
      </div>
    </template>
  </van-cell>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {ChatRoomType} from "../models/chatRoom";
import {Toast} from "vant";

const router = useRouter();

const click = () => {
  Toast.fail("1");
}

interface HistoryRoomCardListProps {
  chatRoomList: ChatRoomType[];
}

const props = withDefaults(defineProps<HistoryRoomCardListProps>(), {
  // @ts-ignore
  chatRoomList: [] as ChatRoomType[],
});
</script>

<style scoped>
.custom-cell {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}

.custom-title {
  font-weight: bold;
  margin-top: 0;
  margin-right: 4px;
  vertical-align: middle;
  font-size: 15px;
}

</style>