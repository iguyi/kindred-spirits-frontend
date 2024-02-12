<!-- todo 统计未读消息数 -->
<template>
  <van-cell
      @click="click(chatRoom.receiverId, chatRoom.receiverName, chatRoom.chatType)"
      v-for="chatRoom in chatRoomList"
      is-link
  >
    <template #right-icon></template>

    <!--  最新一条消息的发送时间  -->
    <template #extra class="sendTime">
      <div>
        {{ chatRoom.sendTime }}
        <br v-if="chatRoom.unreadMessageNum > 0">
        <van-icon
            v-if="chatRoom.unreadMessageNum > 0"
            :badge="chatRoom.unreadMessageNum > 99 ? '99+' : chatRoom.unreadMessageNum"
            style="margin-left: 30px"
        />
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
          <span class="custom-title">
            {{
              chatRoom.receiverName.length <= 11 ? chatRoom.receiverName : chatRoom.receiverName.substring(0, 8) + '...'
            }}
          </span><br>
          <span>
            {{ chatRoom.lastRecord.length <= 20 ? chatRoom.lastRecord : chatRoom.lastRecord.substring(0, 17) + '...' }}
          </span>
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
 * @param isTeamChat  - 是否是队伍
 */
const click = (id, name, isTeamChat) => {
  if (isTeamChat === 1) {
    // 进入对应的私聊室
    router.push({
      path: '/chat',
      query: {
        friendId: id,
        name: name
      }
    });
  } else {
    // 进入对应的队伍聊天室
    router.push({
      path: '/chat',
      query: {
        teamId: id,
        name: name,
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