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
          @click="joinTeam(team.id, team.status)"
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

  <van-dialog
      @confirm="joinPrivate"
      @cancel="clearJoinTeamParams"
      v-model:show="privateTeamShow"
      title="入队验证"
      show-cancel-button>
    <van-field
        v-model="joinTeamParams.teamLink"
        clearable
        label="邀请码"
        left-icon="link-o"
        placeholder="请输入邀请码"
    />
  </van-dialog>
</template>

<script setup lang="ts">
import {TeamType} from "../models/team";
import {useRouter} from "vue-router";
import myAxios from "../plugins/myAxios";
import {Toast} from "vant";
import {ref} from "vue";

const router = useRouter();

// 用于展示在加入私有队伍的申请表单
const privateTeamShow = ref(false);

const joinTeamParams = ref({
  teamId: 0,
  password: '',
  teamLink: ''
});

/**
 * 加入队伍, 根据目标队伍类型, 选择加入时的操作
 * @param teamId - 目标队伍 id
 * @param status - 目标队伍类型
 */
const joinTeam = async (teamId: number, status: number) => {
  joinTeamParams.value.teamId = teamId

  if (status == 1) {
    // 私有队伍
    privateTeamShow.value = true;
    return;
  }

  if (status == 2) {
    // 加密队伍
    return;
  }

  // 加入公开队伍
  await join();
}

/**
 * 加入公开队伍、加密队伍
 */
const join = async () => {
  const res = await myAxios.post('/team/join', {
    'teamId': joinTeamParams.value.teamId,
    'password': joinTeamParams.value.password,
    'teamLink': joinTeamParams.value.teamLink
  });

  if (res.data.code === 0 && res.data.data) {
    Toast.success('操作成功');
  } else {
    Toast.fail(res.data.description);
  }

  clearJoinTeamParams();
}

/**
 * 加入私有队伍 / 更加邀请码加入队伍
 */
const joinPrivate = async () => {
  const res = await myAxios.post('/team/join/link', {
    'teamId': joinTeamParams.value.teamId,
    'teamLink': joinTeamParams.value.teamLink
  });

  if (res.data.code === 0 && res.data.data) {
    Toast.success('操作成功');
  } else {
    Toast.fail(res.data.description);
  }

  clearJoinTeamParams();
}

/**
 * 清空 joinTeamParams
 */
const clearJoinTeamParams = () => {
  joinTeamParams.value.teamId = 0;
  joinTeamParams.value.password = '';
  joinTeamParams.value.teamLink = '';
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