<template>
  <div style="position: fixed;top: 35px; width: 100%">
    <img src="http://localhost:3000/public/logo.ico"
         style="height: 100px; border-radius: 50%; display: block; margin: 0 auto;"
         alt="Logo"
    >
  </div>

  <van-tabs v-model:active="active" swipeable color="#00994C" type="card"
            style="position: fixed; top: 150px; width: 100%">
    <van-tab title="登录">
      <br/>
      <div>
        <van-form @submit="onLoginSubmit">
          <van-cell-group inset>
            <van-field
                v-model="loginUserAccount"
                name="userAccount"
                label="账号"
                placeholder="请填写账号"
                :rules="[{ required: true, message: '请填写账号' }]"
            />
            <van-field
                v-model="loginUserPassword"
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
      </div>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
      <br/><br/><br/><br/><br/><br/><br/><br/><br/>
    </van-tab>

    <van-tab title="注册">
      <br/>
      <div>
        <van-form @submit="onRegisterSubmit">
          <van-cell-group inset>
            <van-field
                v-model="registerUserPassword"
                type="password"
                name="userPassword"
                label="密码"
                placeholder="请填写密码"
                :rules="[{ required: true, message: '请填写密码' }]"
            />
            <van-field
                v-model="checkPassword"
                type="password"
                name="checkPassword"
                label="确认密码"
                placeholder="请确认密码"
                :rules="[{ required: true, message: '请确认密码' }]"
            />
          </van-cell-group>

          <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit">
              注册
            </van-button>
          </div>
        </van-form>
      </div>
    </van-tab>
  </van-tabs>

</template>

<script setup lang="ts">
import {ref} from "vue";
import myAxios from "../../plugins/myAxios";
import {Toast} from "vant";
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();

// =============== 登录部分 ===============
const loginUserAccount = ref('');
const loginUserPassword = ref('');
const onLoginSubmit = async () => {
  const res = await myAxios.post('/user/login', {
    userAccount: loginUserAccount.value,
    userPassword: loginUserPassword.value
  });
  console.log('用户登录\n', res);
  if (res.data.code === 0 && res.data.data) {
    // 跳转到之前的页面(暂时放弃)
    // window.location.href = route.query?.redirect as string ?? '/';
    await router.replace('/');
  } else {
    Toast.fail('登录失败');
  }
};

// =============== 注册部分 ===============
const registerUserPassword = ref('');
const checkPassword = ref('');
const onRegisterSubmit = async () => {
  const res = await myAxios.post('/user/register', {
    userPassword: registerUserPassword.value,
    checkPassword: checkPassword.value
  });
  console.log('用户注册\n', res);
  if (res.data.code === 0 && res.data.data) {
    // 跳转到之前的页面
    await router.replace('/setting');
    // window.location.href = '/setting';
  } else {
    Toast.fail('注册失败');
  }
}
</script>

<style scoped>

</style>