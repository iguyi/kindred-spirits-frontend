<template>
  <van-form @submit="onSubmit">
    <van-cell-group inset>
      <van-field
          v-model="userAccount"
          name="userAccount"
          label="账号"
          placeholder="请填写账号"
          :rules="[{ required: true, message: '请填写账号' }]"
      />
      <van-field
          v-model="userPassword"
          type="password"
          name="userPassword"
          label="密码"
          placeholder="请填写密码"
          :rules="[{ required: true, message: '请填写密码' }]"
      />
    </van-cell-group>
    <div style="margin: 16px;">
      <van-button round block type="primary" native-type="submit">
        登录
      </van-button>
    </div>
  </van-form>

</template>

<script setup lang="ts">
import {ref} from "vue";
import myAxios from "../../plugins/myAxios";
import {Toast} from "vant";
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();

const userAccount = ref('');
const userPassword = ref('');
const onSubmit = async () => {
  const res = await myAxios.post('/user/login', {
    userAccount: userAccount.value,
    userPassword: userPassword.value
  });
  console.log('用户登录\n', res);
  if (res.data.code === 0 && res.data.data) {
    // 跳转到之前的页面
    window.location.href = route.query?.redirect as string ?? '/';
    // await router.replace(redirectUrl);
  } else {
    Toast.fail('登录失败');
  }
};
</script>

<style scoped>

</style>