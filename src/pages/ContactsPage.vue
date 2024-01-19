<template>
  <van-search
      v-model="searchText"
      show-action
      placeholder="输入 好友昵称或队伍 进行搜索"
  >
    <template #action>
      <div style="display: flex; align-items: center;">
        <van-button
            v-if="!isShowTab"
            icon="revoke"
            type="primary"
            size="small"
            color="red"
            @click="clearSearch"
        />
        <van-button
            icon="search"
            type="primary"
            size="small"
            @click="dofSearch"
            style="margin-left: 5px"
        />
      </div>
    </template>
  </van-search>

  <div v-if="!isShowTab">

    <van-collapse
        v-if="(searchTeamList && searchTeamList.length > 0) || (searchFriendList && searchFriendList.length > 0)"
        v-model="activeNames"
    >
      <van-collapse-item title="好友列表" name="1">
        <friend-card-list :friend-list="searchFriendList"/>
      </van-collapse-item>

      <van-collapse-item title="队伍列表" name="2">
        <team-card-list-simple :team-list="searchTeamList"/>
      </van-collapse-item>
    </van-collapse>

    <van-empty
        v-if="(!searchFriendList || searchFriendList.length < 1) && (!searchTeamList || searchTeamList.length < 1)"
        image="search"
        description="数据为空"/>
  </div>

  <van-tabs
      v-if="isShowTab"
      v-model:active="active"
      @change="queryMyJoinTeam"
  >
    <van-tab title="好友">
      <friend-card-list :friend-list="friendList"/>
      <van-empty v-if="(!friendList || friendList.length < 1) && $route.meta.result" image="search"
                 description="数据为空"/>
    </van-tab>

    <van-tab title="队伍">
      <van-cell
          title="创建队伍"
          center
      >
        <van-button
            icon="plus"
            type="primary"
            size="small"
            :onclick="doCreateTeam"
        />
      </van-cell>

      <van-collapse v-model="updateShowTeamType" accordion>
        <van-collapse-item title="我加入的队伍" name="1">
          <team-card-list-simple :team-list="inTeamList"/>
        </van-collapse-item>
        <van-collapse-item title="我管理的队伍" name="2">
          <team-card-list-simple :team-list="leaderTeamList"/>
        </van-collapse-item>
      </van-collapse>

    </van-tab>
  </van-tabs>
</template>

<script setup>
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import TeamCardListSimple from "../components/TeamCardListSimple.vue";
import myAxios from "../plugins/myAxios";
import FriendCardList from "../components/FriendCardList.vue";

const router = useRouter();

/**
 * 为 false 时展示搜索结果
 */
const isShowTab = ref(true);


//------------------- 好友 -------------------
/**
 * 我的好友列表
 */
const friendList = ref([]);

onMounted(async () => {
  const friendDataList = await myAxios.get('/friend/list', {
    params: {},
  }).then(function (response) {
    console.log('/friend/list succeed. ' + response);
    return response.data?.data;
  }).catch(function (error) {
    console.log('/friend/list error. ' + error);
  });

  if (friendDataList) {
    friendDataList.forEach(friend => {
      if (friend.tags) {
        friend.tags = JSON.parse(friend.tags);
      }
    });
    friendList.value = friendDataList;
  }
});


//------------------- 队伍 -------------------
/**
 * 我在的队伍
 */
const inTeamList = ref([]);

/**
 * 更新展示队伍类型: 我加入、我管理
 */
const updateShowTeamType = ref('1');

/**
 * 我管理的队伍
 */
const leaderTeamList = ref([]);

/**
 * 创建队伍
 */
const doCreateTeam = () => {
  router.push({
    path: "/team/create"
  });
}

/**
 * 查询队伍
 */
const queryMyJoinTeam = async () => {
  // 查询我在的队伍
  const joinRes = await myAxios.get("/team/list/my/join");
  const inTeamListData = joinRes.data.data;
  if (joinRes.data.code === 0 && inTeamListData) {
    inTeamList.value = inTeamListData;
  }

  // 查询我管理的队伍
  const leaderRes = await myAxios.get("/team/list/my/leader")
  const leaderTeamListData = leaderRes.data.data;
  if (leaderRes.data.code === 0 && leaderTeamListData) {
    leaderTeamList.value = leaderTeamListData;
  }
}

//------------------- 搜索 -------------------

/**
 * 搜索到的好友列表
 */
const searchFriendList = ref([]);

/**
 * 搜索到的队伍列表
 */
const searchTeamList = ref([]);

/**
 * 搜索内容
 */
const searchText = ref('');

/**
 * 1-展示好友列表
 * 2-展示队伍列表
 */
const activeNames = ref(['1']);

/**
 * 搜索好友或队伍
 */
const dofSearch = async () => {
  searchFriendList.value = [];
  searchTeamList.value = [];

  friendList.value.forEach(friend => {
    if (friend.username.indexOf(searchText.value) !== -1) {
      searchFriendList.value.push(friend);
    }
  });

  await queryMyJoinTeam();

  inTeamList.value.forEach(team => {
    if (team.name.indexOf(searchText.value) !== -1) {
      searchTeamList.value.push(team);
    }
  });

  isShowTab.value = false;
}

/**
 * 退出搜索
 */
const clearSearch = () => {
  searchText.value = '';
  searchFriendList.value = [];
  searchTeamList.value = [];
  isShowTab.value = true;
}

</script>

<style scoped>

</style>