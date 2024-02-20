<template>
  <!--  <van-tabs v-model:active="active" :swipeable="true" :offset-top="45" @change="findTeam" sticky>-->
  <van-tabs :swipeable="true" :offset-top="45" @change="findTeam" sticky>
    <van-tab title="找道友">
      <van-cell center title="心动模式">
        <template #right-icon>
          <van-switch v-model="isLike" size="24"/>
        </template>
      </van-cell>
      <span>&nbsp;</span>

      <user-card-list :user-list="userList" :flush-path="isLike ? userCarType.match : userCarType.recommend"/>
      <van-empty v-if="(!userList || userList.length < 1) && $route.meta.result" image="search" description="数据为空"/>
    </van-tab>

    <van-tab title="找队伍">
      <team-card-list :team-list="teamList"/>
      <van-empty v-if="(!teamList || teamList.length < 1) && $route.meta.result" image="search" description="数据为空"/>
    </van-tab>
  </van-tabs>
</template>

<script setup lang="ts">
import {ref, watchEffect} from "vue";
import myAxios from "../plugins/myAxios";
import {Toast} from "vant";
import qs from "qs";
import UserCardList from "../components/UserCardList.vue";
import {useRouter} from "vue-router";
import TeamCardList from "../components/TeamCardList.vue";
import {userCarType} from "../states/userCar";

const router = useRouter();

//------------------- 加道友 -------------------
/**
 * like 为 true 时, 走最佳匹配
 */
const isLike = ref(false);

const userList = ref([]);

const loadData = async () => {
  let userListData;
  let dataNum = 10;

  if (isLike.value) {
    // 心动模式
    userListData = await myAxios.get('/user/match', {
      params: {
        num: dataNum
      }
    }).then(function (response) {
      console.log('/user/match succeed. ' + response);
      return response.data?.data;
    }).catch(function (error) {
      console.log('/user/match error. ' + error);
    })
  } else {
    // 普通模式
    userListData = await myAxios.get('/user/recommend', {
      params: {
        pageSize: dataNum,
        pageNum: 1
      },
      paramsSerializer: params => {
        return qs.stringify(params, {indices: false});
      }
    }).then(function (response) {
      console.log('/user/recommend succeed. ' + response);
      return response.data?.data;
    }).catch(function (error) {
      console.log('/user/recommend error. ' + error);
      Toast.fail('搜索失败');
    });
  }

  if (userListData) {
    userListData.forEach(user => {
      if (user.tags) {
        user.tags = JSON.parse(user.tags);
      }
    });
    userList.value = userListData;
  }
}

watchEffect(() => {
  loadData();
});

//------------------- 加队伍 -------------------
const teamList = ref([]);

const findTeam = async () => {
  const teamListData = await myAxios.get('/team/list/page', {
    params: {
      status: 0
    },
    paramsSerializer: params => {
      return qs.stringify(params, {indices: false});
    }
  }).then(function (response) {
    console.log('/team/list/page succeed. ' + response);
    return response.data?.data;
  }).catch(function (error) {
    console.log('/team/list/page error. ' + error);
    Toast.fail('搜索失败');
  });

  if (teamListData) {
    teamList.value = teamListData.records;
  }
}
</script>

<style scoped>
</style>