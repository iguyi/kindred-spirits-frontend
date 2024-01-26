<!-- todo 统计未读消息数 -->
<template>
  <van-cell
      @click="click(chatRoom.receiverId, chatRoom.receiverName, chatRoom.avatarUrl, chatRoom.chatType)"
      v-for="chatRoom in chatRoomList"
      is-link
  >
    <template #right-icon></template>

    <!--  添加好友  -->
    <template #extra class="sendTime">
      <div>
        {{ chatRoom.sendTime }}
        <br>
        <van-icon badge="99+" style="margin-left: 30px"/>
      </div>
    </template>

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
          <span class="custom-title">{{ chatRoom.receiverName }}</span><br>
          <span>{{ chatRoom.lastRecord }}</span>
        </div>
      </div>
    </template>
  </van-cell>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {ChatRoomType} from "../models/chatRoom";

const router = useRouter();

/**
 * 进入聊天室
 *
 * @param id          - 好友 id 或队伍 id
 * @param name        - 好友昵称或队伍名
 * @param avatarUrl   - 头像
 * @param isTeamChat  - 是否是队伍
 */
const click = (id, name, avatarUrl, isTeamChat) => {
  // alert(`id: ${id}\n name: ${name}\n avatarUrl: ${avatarUrl}\n isTeamChat: ${isTeamChat}`);
  if (isTeamChat === 1) {
    // 进入对应的私聊室
    router.push({
      path: '/chat/private',
      query: {
        friendId: id,
        username: name,
        avatarUrl: avatarUrl
      }
    });
  } else {
    // 进入对应的队伍聊天室
    router.push({
      path: '/chat/team',
      query: {
        teamId: id,
        teamName: name,
      }
    });
  }
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