<template>
  <van-cell
      v-for="team in teamList"
      center
  >
    <template #right-icon>
    </template>
    <template #extra>
      <van-button
          type="primary"
          size="mini"
          @click="sendMessage(team.id, team.name, 'http://localhost:3000/public/team_avatar')"
      >
        发消息
      </van-button>
    </template>
    <template #default>
      <div class="custom-cell">
        <div>
          <van-image
              round
              width="30px"
              height="30px"
              src="http://localhost:3000/public/avatar/team/default_avatar.jpg"
          />
        </div>
        <div style="margin-left: 5px">
          <span class="content">{{ team.name }}</span><br>
        </div>
      </div>
    </template>
  </van-cell>
</template>

<script setup lang="ts">
import {TeamType} from "../models/team";
import {useRouter} from "vue-router";

const router = useRouter();

/**
 * 进入队伍聊天室
 *
 * @param id        - 队伍 id
 * @param username  - 队伍昵称
 * @param avatarUrl - 队伍头像
 */
const sendMessage = (id, username, avatarUrl) => {
  router.push({
    path: '/chat/team',
    query: {
      friendId: id,
      username: username,
      avatarUrl: avatarUrl
    }
  });
}

interface TeamCardListSimpleProps {
  teamList: TeamType[];
}

const props = withDefaults(defineProps<TeamCardListSimpleProps>(), {
  // @ts-ignore
  teamList: [] as TeamType[],
});
</script>

<style scoped>
.custom-cell {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}

.content {
  margin-right: 4px;
  font-size: 20px;
}
</style>