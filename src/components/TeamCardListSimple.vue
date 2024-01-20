<template>
  <van-cell
      v-for="team in teamList"
      center
  >
    <template #right-icon></template>

    <template #extra>
      <van-button
          type="primary"
          size="mini"
          @click="sendMessage(team.id, team.name)"
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
              :src="team.avatarUrl"
          />
        </div>
        <div style="margin-left: 5px">
          <span class="custom-tag">{{ team.name }}</span><br>
        </div>
      </div>
    </template>
  </van-cell>
</template>

<script setup lang="ts">
import {TeamType} from "../models/team";
import {useRouter} from "vue-router";

const router = useRouter();

interface TeamCardListSimpleProps {
  teamList: TeamType[];
}

const props = withDefaults(defineProps<TeamCardListSimpleProps>(), {
  // @ts-ignore
  teamList: [] as TeamType[],
});

/**
 * 进入队伍聊天室
 *
 * @param teamId
 * @param teamName
 */
const sendMessage = (teamId, teamName) => {
  router.push({
    path: '/chat/team',
    query: {
      teamId: teamId,
      teamName: teamName,
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