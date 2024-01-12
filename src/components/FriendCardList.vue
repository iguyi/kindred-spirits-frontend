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
        <!-- 头像 -->
        <div>
          <van-image
              round
              width="80px"
              height="80px"
              :src="friend.avatarUrl"
          />
        </div>
        <!-- 用户信息 -->
        <div style="margin-left: 5px">
          <span class="custom-title">{{ friend.username }}</span><br>
          <van-tag class="custom-tag"
                   v-for="tag in friend.tags"
                   type="danger"
          >
            {{ tag }}
          </van-tag>
          <br>
          <span>{{ friend.profile }}</span>
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

const props = withDefaults( defineProps<FriendCardListProps>(), {
  // @ts-ignore
  friendList: [] as UserType[],
});

/**
 * todo 发消息
 */
const sendMessage = (id, username ,avatarUrl) => {
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
}

.custom-title {
  font-weight: bold;
  margin-top: 0;
  margin-right: 4px;
  vertical-align: middle;
  font-size: 28px;
}

.custom-tag {
  margin-right: 4px;
  vertical-align: middle;
  font-size: 10px;
}
</style>