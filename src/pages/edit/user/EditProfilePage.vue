<template>
  <!-- 顶部 -->
  <van-nav-bar
      v-if="!$route.meta.navBar"
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
      <van-icon name="success" size="18"/>
    </template>
  </van-nav-bar>

  <van-field
      v-model="text"
      rows="4"
      autosize
      label="个人简介"
      type="textarea"
      :placeholder="editUser.currentValue"
      :rules="[{ required: 0, message: '简单介绍一下自己吧' }]"
  />
</template>

<script setup>
import {ref} from "vue";
import {Toast} from "vant";
import {useRoute, useRouter} from "vue-router";
import {getCurrentUser, updateCacheUser} from "../../../services/user";
import myAxios from "../../../plugins/myAxios";

const router = useRouter();
const onClickLeft = () => {
  router.back();
};

const route = useRoute();
const editUser = ref({currentValue: route.query.currentValue});

const text = ref('');

let res;
const onClickRight = async () => {
  // 获取当前用户
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    Toast.fail('用户未登录')
    return;
  }

  const textValue = text.value;
  res = await myAxios.post('/user/update', {
    'id': currentUser.id,
    'profile': textValue === '' ? currentUser : textValue,
  });
  if (res.data.code === 0 && res.data.data > 0) {
    await updateCacheUser();
    Toast.success('修改成功');
  } else {
    Toast.fail('修改失败');
  }

  router.back();
}
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