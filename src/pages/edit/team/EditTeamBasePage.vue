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
      <!-- 队伍名 -->
      <van-field
          v-model="updateTeamData.name"
          name="name"
          label="队伍名"
          placeholder="请输入队伍名"
          :rules="[{required: true, message: '请输入队伍名'}]"
      />

      <!-- 队伍状态 -->
      <van-field name="radio" label="队伍状态">
        <template #input>
          <van-radio-group v-model="updateTeamData.status" direction="horizontal">
            <van-radio name="0">公开</van-radio>
            <van-radio name="1">私有</van-radio>
            <van-radio name="2">加密</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <!-- 密码 -->
      <van-field
          v-if="updateTeamData.status === '2'"
          v-model="updateTeamData.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请填写入队密码"
          :rules="[{ required: !hasPwd, message: '请填写密码' }]"
      />
      <van-cell v-if="updateTeamData.status === '2'">
        <template #title>
          <div style="color: deepskyblue;">此前已设置过密码</div>
        </template>
        <template #right-icon>
          <van-switch v-model="hasPwd" size="14" />
        </template>
      </van-cell>
    </van-cell-group>

    <div style="margin: 16px;">
      <van-button round block type="primary" native-type="submit">
        提交
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {ref} from "vue";
import {Toast} from "vant";
import myAxios from "../../../plugins/myAxios";
import {getCurrentUser} from "../../../services/user";

const router = useRouter();
const route = useRoute();

/**
 * 此前是否为队伍设置过密码
 */
const hasPwd = ref(false);

const teamId = Number(route.query.teamId);
let currentValue = JSON.parse(route.query.currentValue);
const name = currentValue.name;
const status = currentValue.status;

const updateTeamData = ref({
  "name": name,
  "status": status,
  "password": ""
});

const onClickLeft = () => {
  router.back();
};

//===============================

/**
 * 提交更新
 */
const onClickRight = async () => {
  // 获取当前用户
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    Toast.fail('用户未登录')
    return;
  }

  let teamPassword = updateTeamData.value.password;
  if (updateTeamData.value.status === '2' && !hasPwd && teamPassword === '') {
    Toast.fail('加密队伍必须设置密码');
    return;
  }

  let res = await myAxios.post('/team/update', {
    'id': teamId,
    'name': updateTeamData.value.name,
    'status': Number.parseInt(updateTeamData.value.status),
    'password': updateTeamData.value.password
  });
  if (res.data.code === 0 && res.data.data > 0) {
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