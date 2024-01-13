<template>
  <user-card-list :user-list="userList"/>
  <van-empty v-if="(!userList || userList.length < 1) && $route.meta.result" image="search" description="暂无搜索结果"/>
</template>

<script setup>
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../../plugins/myAxios.ts";
import {Toast} from "vant";
import qs from "qs";
import UserCardList from "../../components/UserCardList.vue";

const userList = ref([]);
const route = useRoute();
const {tags} = route.query;
onMounted(async () => {
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
});
</script>

<style scoped>

</style>