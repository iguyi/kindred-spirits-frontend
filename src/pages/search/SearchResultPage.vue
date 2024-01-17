<template>
  <user-card-list :user-list="userList" :v-if="isUserResult"/>
  <team-card-list :team-list="teamList" :v-if="!isUserResult"/>
  <van-empty
      v-if="(!userList || userList.length < 1) && (!teamList || teamList.length < 1) && $route.meta.result"
      image="search"
      description="暂无搜索结果"/>
</template>

<script setup>
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../../plugins/myAxios.ts";
import {Toast} from "vant";
import qs from "qs";
import UserCardList from "../../components/UserCardList.vue";
import TeamCardList from "../../components/TeamCardList.vue";

const route = useRoute();

/**
 * 查询结果 - 用户列表
 */
const userList = ref([]);

/**
 * 查询结果 - 队伍列表
 */
const teamList = ref([]);

/**
 * 是否是是用户搜索结果
 */
const isUserResult = ref(true);

onMounted(async () => {
  const {model, tags, searchCondition, searchTeamCondition} = await route.query;

  isUserResult.value = model !== '3';

  if (model === '1') {
    const userListData = await myAxios.get('/user/search/tags', {
      params: {
        tagNameList: tags,
      },
      paramsSerializer: params => {
        // opts: arg[0]=1&arg[1]=2
        return qs.stringify(params, {indices: false});
      }
    }).then(function (response) {
      console.log('/user/search/tags succeed' + response);
      return response.data?.data;
    }).catch(function (error) {
      console.log('/user/search/tags error' + error);
      Toast.fail('搜索失败');
    });

    if (userListData) {
      userListData.forEach(user => {
        user.tags = JSON.parse(user.tags);
      });
      userList.value = userListData;
    }
    return;
  }

  if (model === '2') {
    const userListData = await myAxios.get('/user/search', {
      params: {
        searchCondition: searchCondition,
      }
    });
    if (userListData) {
      userListData.data.data.forEach(user => {
        user.tags = JSON.parse(user.tags);
      });
      userList.value = userListData.data.data;
    }
    return;
  }

  const teamListData = await myAxios.get('/team/search', {
    params: {
      searchCondition: searchTeamCondition,
    }
  });
  if (teamListData) {
    teamList.value = teamListData.data.data;
  }
});
</script>

<style scoped>

</style>