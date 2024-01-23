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

  <van-form @submit="onClickRight">
    <van-cell-group inset>
      <van-field
          v-model="oldPwd"
          type="password"
          name="原密码"
          label="原密码"
          placeholder="请输入原密码"
          :rules="[{ required: true, message: '请输入原密码' }]"
      />
      <van-field
          v-model="newPwd"
          type="password"
          name="新密码"
          label="新密码"
          placeholder="请设置新密码"
          :rules="[{ required: true, message: '请设置新密码' }]"
      />
      <van-field
          v-model="checkPwd"
          type="password"
          name="确认密码"
          label="确认密码"
          placeholder="请确认新密码"
          :rules="[{ required: true, message: '请确认新密码' }]"
      />
    </van-cell-group>
    <div style="margin: 16px;">
      <van-button round block type="primary" native-type="submit">
        修改
      </van-button>
    </div>
  </van-form>

</template>

<script setup lang="ts">
import {Toast} from "vant";
import {useRoute, useRouter} from "vue-router";
import {clearCacheUser, getCurrentUser} from "../../services/user";
import myAxios from "../../plugins/myAxios";
import {ref} from "vue";

const router = useRouter();
const route = useRoute();

const oldPwd = ref('');
const newPwd = ref('');
const checkPwd = ref('');


const onClickRight = async () => {
  // 获取当前用户
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    Toast.fail('用户未登录');
    return;
  }

  if (newPwd.value === oldPwd.value) {
    Toast.fail('新密码和旧密码输入重复');
    return;
  }

  if (newPwd.value !== checkPwd.value) {
    Toast.fail('新密码和确认密码不一致');
    return;
  }

  const res = await myAxios.post('/user/update/pwd', {
    oldPwd: oldPwd.value,
    newPwd: newPwd.value,
    checkPwd: checkPwd.value
  });

  if (res || res.data.code === 0 || res.data.data === true) {
    Toast.success("密码修改成功, 请重新登录");
    await clearCacheUser()
    await router.replace('/user/login');
    return
  }

  Toast.success(res.data.description ?? "系统繁忙");
}

const onClickLeft = () => {
  router.back();
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