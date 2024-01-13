<!-- todo 样式待改, 查看 QQ 好友列表 -->
<template>
  <van-cell
      v-for="friend in friendList"
      center
  >
    <template #right-icon>
    </template>
    <!--  发消息  -->
    <template #extra>
      <van-button
          type="primary"
          size="mini"
          @click="sendMessage(friend.id, friend.username, friend.avatarUrl)"
      >
        发消息
      </van-button>
    </template>
    <template #default>
      <div class="custom-cell">
        <div>
          <van-image
              round
              width="35px"
              height="35px"
              :src="friend.avatarUrl"
          />
        </div>
        <div style="margin-left: 5px">
          <span class="custom-tag">{{ friend.username }}</span>
        </div>
      </div>
    </template>
  </van-cell>
</template>

<script setup lang="ts">
import {UserType} from "../models/user";
import {useRouter} from "vue-router";

const router = useRouter();

interface FriendCardListProps {
  friendList: UserType[];
}

const props = withDefaults(defineProps<FriendCardListProps>(), {
  // @ts-ignore
  friendList: [] as UserType[],
});

/**
 * 进入私聊室
 *
 * @param id        - 好友 id
 * @param username  - 好友昵称
 * @param avatarUrl - 好友头像
 */
const sendMessage = (id, username, avatarUrl) => {
  router.push({
    path: '/chat/private',
    query: {
      friendId: id,
      username: username,
      avatarUrl: avatarUrl
    }
  });
}
</script>

<style scoped>
.custom-cell {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  margin-left: 10px;
}

.custom-tag {
  margin-left: 10px;
  margin-right: 4px;
  vertical-align: middle;
  font-size: 20px;
}
</style>