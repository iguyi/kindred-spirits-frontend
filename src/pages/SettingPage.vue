<template>
  <template v-if="user">
    <van-cell
        title="头像"
        is-link
        center
        @click="toEdit('/edit/user/avatar', user.avatarUrl)"
    >
      <van-image
          round
          width="48px"
          height="48px"
          :src="user.avatarUrl"
      />
    </van-cell>

    <van-cell
        title="昵称"
        center
        is-link
        :value="user.username"
        @click="toEdit('/edit/user/username', user.username)"
    />

    <van-cell
        title="个人简介"
        is-link
        center
        :value="user.profile"
        @click="toEdit('/edit/user/profile', user.profile)"
    />

    <van-cell
        title="我的标签"
        is-link
        center
        :value="user.tags"
        @click="toEdit('/edit/user/tag', JSON.stringify(user.tags))"
    >
      <van-tag
          type="success"
          v-for="tag in user.tags"
          style="margin-right: 3px"
      >
        {{ tag }}
      </van-tag>
    </van-cell>

    <van-cell
        title="账号"
        :value="user.userAccount"
    />

    <van-cell
        title="性别"
        is-link
        :value="(user.gender===0) ? `男` : `女`"
        @click="toEdit('/edit/user/gender', user.gender)"
    />

    <van-cell
        title="手机号"
        is-link
        :value="user.phone"
        @click="toEdit('/edit/user/phone', user.phone)"
    />

    <van-cell
        title="邮箱"
        is-link
        :value="user.email"
        @click="toEdit('/edit/user/email', user.email)"
    />

    <van-cell
        title="修改密码"
        is-link
        @click="toEdit('/edit/user/pwd', '')"
    />

    <van-cell
        title="创建时间"
        :value="user.createTime"
    />

    <van-cell
        title="退出登录"
        is-link
        @click="logout"
    />
  </template>
</template>

<script setup lang="ts">
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {clearCacheUser, getCurrentUser} from "../services/user";
import myAxios from "../plugins/myAxios";
import {webSocketCache} from "../states/chat";

// 当前登录用户
const user = ref({});

const router = useRouter();

onMounted(async () => {
  user.value = await getCurrentUser();
});

/**
 * 跳转至信息编辑页面
 *
 * @param path - 跳转的页面
 * @param currentValue - 当前信息
 */
const toEdit = (path, currentValue) => {
  router.push({
    path: path,
    query: {currentValue}
  });
}

/**
 * 退出登录
 */
const logout = async () => {
  await myAxios.post('/user/logout');
  await clearCacheUser();
  await router.replace('/user/login');
  if (webSocketCache.privateChat !== null) {
    webSocketCache.privateChat.close();
    webSocketCache.privateChat = null;
  }

  let teamChatMap = webSocketCache.teamChatMap;
  for (let key in teamChatMap) {
    teamChatMap[key].close();
    delete teamChatMap[key];
  }
}
</script>

<style scoped>

</style>