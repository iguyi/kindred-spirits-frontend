<template>
  <van-cell
      v-for="team in teamList"
      center
  >
    <template #right-icon>
    </template>
    <!--  加入队伍  -->
    <template #extra>
      <van-button
          type="primary"
          size="mini"
          @click="joinTeam(team.id)"
      >
        加入
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
              :src="team.avatarUrl"
          />
        </div>
        <!-- 用户信息 -->
        <div style="margin-left: 5px">
          <span class="custom-title">{{ team.name }}</span><br>
          <van-tag
              class="custom-tag"
              type="danger"
          >
            111
          </van-tag>
          <br>
          <span>{{ team.description }}</span>
        </div>
      </div>
    </template>
  </van-cell>
</template>

<script setup lang="ts">
import {TeamType} from "../models/team";
import {useRouter} from "vue-router";
import myAxios from "../plugins/myAxios";
import {Toast} from "vant";

const router = useRouter();

const joinTeam = async (teamId: number) => {
  const res = await myAxios.post('/team/join', {
    'teamId': Number(teamId)
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (res.data.code === 0 && res.data.data) {
    Toast.success('操作成功');
  } else {
    Toast.fail(res.data.description);
  }
}

interface TeamCardListProps {
  teamList: TeamType[];
}

const props = withDefaults(defineProps<TeamCardListProps>(), {
  // @ts-ignore
  teamList: [] as TeamType[],
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
  font-size: 28px;
}

.custom-tag {
  margin-right: 4px;
  vertical-align: middle;
  font-size: 10px;
}
</style>