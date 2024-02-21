<template>
  <user-card-list
      :user-list="userList"
      :tag-name-list="userSearchType === 1 ? userSearchConditionByTag : []"
      :search-condition="userSearchType === 1 ? '' : userSearchCondition"
      :flush-path="userSearchType === 1 ? userCarType.searchUserByTag : userCarType.searchUserByFree"
      v-if="isUserResult && userSearchType !== 0"
  />
  <team-card-list :team-list="teamList" v-if="!isUserResult"/>
  <van-empty
      v-if="(!userList || userList.length < 1) && (!teamList || teamList.length < 1) && $route.meta.result"
      image="search"
      description="暂无搜索结果"
  />
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../../plugins/myAxios";
import {Toast} from "vant";
import qs from "qs";
import UserCardList from "../../components/UserCardList.vue";
import TeamCardList from "../../components/TeamCardList.vue";
import {basePageNumInit, basePageSize} from "../../config/page";
import {userCarType} from "../../states/userCar";

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
 * 是否是用户搜索结果
 */
const isUserResult = ref(true);

/**
 * 0 - 展示的是队伍搜索结果
 * 1 - 展示的是根据标签搜索用户的搜索结果
 * 2- 展示的是自由搜索用户的搜索结果
 */
const userSearchType = ref(0);

const userSearchCondition = ref('');

const userSearchConditionByTag = ref<string[]>([]);

const teamSearchCondition = ref('');

onMounted(async () => {
  userSearchType.value = 0;
  isUserResult.value = true;
  const {model, tags, searchCondition, searchTeamCondition} = await route.query;

  isUserResult.value = model !== '3';

  // 标签搜索
  if (model === '1') {
    userSearchType.value = 1;
    userSearchConditionByTag.value = tags;
    const userListData = await myAxios.get('/user/search/tags', {
      params: {
        tagNameList: tags,
        pageSize: basePageSize,
        pageNum: basePageNumInit
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

  // 自由搜索
  if (model === '2') {
    userSearchType.value = 2;
    userSearchCondition.value = searchCondition;
    const userListData = await myAxios.get('/user/search', {
      params: {
        searchCondition: searchCondition,
        pageSize: basePageSize,
        pageNum: basePageNumInit
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

  // 队伍搜索
  teamSearchCondition.value = searchTeamCondition;
  isUserResult.value = false;
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