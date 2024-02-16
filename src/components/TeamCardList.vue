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
        <!-- 队伍信息 -->
        <div style="margin-left: 5px">
          <span class="custom-title">{{ team.name }}</span><br>
          <span style="color: #0084ff">剩余位置: {{team.maxNum-team.num}}</span>
          <br>
          <span style="color: #969799">
            {{ team.description.length<=12 ? team.description : team.description.substring(0, 10)+'...'}}
          </span>
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

  <van-dialog
      @confirm="joinSecret"
      @cancel="clearJoinTeamParams"
      v-model:show="secretTeamShow"
      title="入队验证"
      show-cancel-button>

    <van-radio-group v-model="checked">
      <van-cell title="使用密码加入队伍" icon="shield-o" clickable @click=" checked = '1'">
        <template #right-icon>
          <van-radio name="1"/>
        </template>
      </van-cell>
      <van-cell title="使用邀请码加入队伍" icon="link-o" clickable @click=" checked = '2'">
        <template #right-icon>
          <van-radio name="2"/>
        </template>
      </van-cell>
    </van-radio-group>

    <van-field
        v-if="checked === '1'"
        v-model="joinTeamParams.password"
        type="password"
        clearable
        label="密码"
        left-icon="shield-o"
        placeholder="请输入密码"
    />
    <van-field
        v-if="checked === '2'"
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

// 用于展示在加入加密队伍的申请表单
const secretTeamShow = ref(false);
const checked = ref('1');

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
    secretTeamShow.value = true;
    return;
  }

  // 加入公开队伍
  await myJoin();
}

/**
 * 加入公开队伍、加密队伍
 */
const myJoin = async () => {
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
 * 加入加密队伍
 */
const joinSecret = async () => {
  let joinModel = checked.value;

  if (joinModel === '1') {
    await myJoin();
  } else {
    await joinPrivate();
  }

  checked.value = '1';
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