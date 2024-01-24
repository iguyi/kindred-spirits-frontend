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
      v-model="result"
      is-link
      readonly
      name="picker"
      label="性别"
      :placeholder="(editUser.currentValue === '0')?`男`:`女`"
      @click="showPicker = true"
  />
  <van-popup v-model:show="showPicker" position="bottom">
    <van-picker
        :columns="columns"
        @confirm="onConfirm"
        @cancel="showPicker = false"
    />
  </van-popup>
</template>

<script setup>
import {useRoute, useRouter} from "vue-router";
import {ref} from "vue";
import {Toast} from "vant";
import myAxios from "../../../plugins/myAxios.ts";
import {getCurrentUser, updateCacheUser} from "../../../services/user.ts";

const router = useRouter();
const onClickLeft = () => {
  router.back();
};

const route = useRoute();
const editUser = ref({currentValue: route.query.currentValue});

let res;
const onClickRight = async () => {
  // 获取当前用户
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    Toast.fail('用户未登录')
    return;
  }

  const gender = (editUser.value.currentValue === '男' || editUser.value.currentValue === '0') ? 0 : 1;
  res = await myAxios.post('/user/update', {
    'id': currentUser.id,
    'gender': gender
  });
  if (res.data.code === 0 && res.data.data > 0) {
    await updateCacheUser();
    Toast.success('修改成功');
  } else {
    Toast.fail('修改失败');
  }

  router.back();
}

//--------- 选择框 ---------

const result = ref('');
const showPicker = ref(false);
const columns = ['男', '女'];

const onConfirm = (value) => {
  result.value = value;
  editUser.value.currentValue = value;
  showPicker.value = false;
};
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