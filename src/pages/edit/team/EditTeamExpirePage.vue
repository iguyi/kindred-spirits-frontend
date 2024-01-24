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

  <!-- 时间选择器 -->
  <van-field
      is-link
      readonly
      name="datetimePicker"
      label="时间选择"
      :placeholder="dateFormat(new Date(currentValue.currentValue)) === dateFormat(new Date(null)) ?
          '选择队伍过期时间' : dateFormat(new Date(currentValue.currentValue))"
      @click="showPicker = true"
  />
  <van-popup v-model:show="showPicker" position="bottom">
    <van-datetime-picker
        v-model="currentValue.currentValue"
        type="datetime"
        title="选择队伍过期时间"
        :min-date="minDate"
        @confirm="showPicker = false"
        @cancel="showPicker = false"
    />
  </van-popup>

</template>

<script setup lang="ts">
import {ref} from "vue";
import {Toast} from "vant";
import {useRoute, useRouter} from "vue-router";
import {getCurrentUser} from "../../../services/user";
import myAxios from "../../../plugins/myAxios";

const router = useRouter();
const route = useRoute();

const currentValue = ref({currentValue: new Date(route.query.currentValue)});
const teamId = Number.parseInt(typeof route.query.teamId === 'string' ? route.query.teamId : '0');

// 展示日期选择器
const showPicker = ref(false);
const minDate = new Date();

// 日期格式化
const dateFormat = (timeData: Date) => {
  return timeData.getFullYear() + '-' + (timeData.getMonth() + 1) + '-' + timeData.getDate() + ' ' +
      timeData.getHours() + ':' + timeData.getMinutes() + ':' + timeData.getSeconds();
}

const onClickLeft = () => {
  router.back();
};

const onClickRight = async () => {
  // 获取当前用户
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    Toast.fail('用户未登录')
    return;
  }

  const dateStr = dateFormat(currentValue.value.currentValue);
  const postData = {
    'id': teamId,
    'expireTime': dateStr
  }
  const res = await myAxios.post("/team/update", postData);
  if (res.data.code === 0 && res.data.data === true) {
    Toast.success('更新成功');
    router.back();
    return;
  }
  Toast.fail(res.data.description);
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