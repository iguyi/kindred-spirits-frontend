<template>
  <!-- 列表 -->
  <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
  >
    <!--  内容  -->
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
            <span style="color: #0084ff">剩余位置: {{ team.maxNum - team.num }}</span>
            <br>
            <span style="color: #969799">
            {{ team.description.length <= 12 ? team.description : team.description.substring(0, 10) + '...' }}
          </span>
          </div>
        </div>
      </template>
    </van-cell>
  </van-list>

  <!-- 私有队伍入队验证 -->
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

  <!-- 加密队伍入队验证 -->
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
import qs from "qs";
import {basePageSize} from "../config/page";
import {teamCarType} from "../states/teamCar";

const router = useRouter();

// 用于展示在加入私有队伍的申请表单
const privateTeamShow = ref(false);

// 用于展示在加入加密队伍的申请表单
const secretTeamShow = ref(false);
const checked = ref('1');

// 入队验证的相关参数
const joinTeamParams = ref({
  teamId: 0,
  password: '',
  teamLink: ''
});

// 列表相关参数
const loading = ref(false);
const finished = ref(false);
const pageNum = ref(2);  // 初始页数为 2, 因为首次展示的数据是第一页的数据

/**
 * 异步加载数据
 */
const onLoad = async () => {
  // 记录数据
  let teamListData = null;

  if (props.flushPath === teamCarType.addPageShow) {
    // 对应 addPage 页
    teamListData = await myAxios.get(teamCarType.addPageShow, {
      params: {
        status: 0,
        pageSize: basePageSize,
        pageNum: pageNum
      },
      paramsSerializer: params => {
        return qs.stringify(params, {indices: false});
      }
    }).then(function (response) {
      loading.value = false;
      console.log(`${props.flushPath} succeed. ${response}`);
      return response.data?.data;
    }).catch(function (error) {
      loading.value = false;
      console.log(`{props.flushPath} error. ${error}`);
      Toast.fail('系统繁忙');
      return;
    });
  }

  if (teamListData === null) {
    // 无数据可加载
    loading.value = false;
    finished.value = true;
    return;
  }
  let teamListDataRecord = teamListData.records;
  if (teamListDataRecord.length === 0) {
    // 无数据可加载
    loading.value = false;
    finished.value = true;
    return;
  }
  teamListDataRecord.forEach(team => {
    props.teamList.push(team);
  });
  pageNum.value = pageNum.value + 1;
  loading.value = false;
}

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
  flushPath: string;
  searchCondition: string;
}

const props = withDefaults(defineProps<TeamCardListProps>(), {
  // @ts-ignore
  teamList: [] as TeamType[],
  flushPath: '' as string,
  searchCondition: "" as string
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