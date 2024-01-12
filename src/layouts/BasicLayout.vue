<template>
  <!-- 顶部 -->
  <van-nav-bar
      v-if="$route.meta.navBar"
      :title="$route.meta.title"
      right-text="按钮"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
      class="custom-navbar"
  >
    <template #left>
      <van-icon name="arrow-left" size="18"/>
    </template>
    <template #right>
      <van-icon name="search" size="18"/>
    </template>
  </van-nav-bar>

  <!-- 主体 -->
  <div style="padding-bottom: 50px;margin-top: 50px;">
    <router-view/>
  </div>

  <!-- 底部 -->
  <van-tabbar v-if="$route.meta.vanTabbar" route @change="onChange" active-color="#ee0a24" inactive-color="#000">
    <van-tabbar-item to="/" icon="chat-o" name="home"></van-tabbar-item>
    <van-tabbar-item to="/contacts" icon="friends-o" name="contacts"></van-tabbar-item>
    <van-tabbar-item to="/add" icon="like-o" name="add"></van-tabbar-item>
    <van-tabbar-item to="/setting" icon="setting-o" name="setting"></van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import {Toast} from "vant";
import {useRouter} from "vue-router";
import {ref} from "vue";

const router = useRouter();

const onClickLeft = () => {
  router.back();

};
// 搜索
const onClickRight = () => {
  router.push('/search');
};

// todo 测试用，待删除
const onChange = (index) => Toast(`${index}`);
</script>

<style scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
</style>