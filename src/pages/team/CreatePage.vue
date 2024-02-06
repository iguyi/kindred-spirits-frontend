<template>
  <van-form @submit="onSubmit">
    <van-cell-group inset>
      <!-- 队伍名 -->
      <van-field
          v-model="addTeamData.name"
          name="name"
          label="队伍名"
          placeholder="请输入队伍名"
          :rules="[{required: true, message: '请输入队伍名'}]"
      />

      <!-- 队伍最大人数 -->
      <van-field name="stepper" label="最大人数">
        <template #input>
          <van-stepper v-model="addTeamData.maxNum" min="2" max="10"/>
        </template>
      </van-field>

      <!-- 时间选择器 -->
      <van-field
          is-link
          readonly
          name="datetimePicker"
          label="时间选择"
          :placeholder="dateFormat(new Date(addTeamData.expireTime)) === dateFormat(new Date(null)) ?
          '选择队伍过期时间' : dateFormat(new Date(addTeamData.expireTime))"
          @click="showPicker = true"
      />
      <van-popup v-model:show="showPicker" position="bottom">
        <van-datetime-picker
            v-model="addTeamData.expireTime"
            type="datetime"
            title="选择队伍过期时间"
            :min-date="minDate"
            @confirm="showPicker = false"
            @cancel="showPicker = false"
        />
      </van-popup>

      <!-- 队伍描述 -->
      <van-field
          v-model="addTeamData.description"
          rows="2"
          autosize
          label="队伍描述"
          type="textarea"
          placeholder="请输队伍描述"
      />

      <!-- 队伍状态 -->
      <van-field name="radio" label="队伍状态">
        <template #input>
          <van-radio-group v-model="addTeamData.status" direction="horizontal">
            <van-radio name="0">公开</van-radio>
            <van-radio name="1">私有</van-radio>
            <van-radio name="2">加密</van-radio>
          </van-radio-group>
        </template>
      </van-field>

      <!-- 密码 -->
      <van-field
          v-if="addTeamData.status === '2'"
          v-model="addTeamData.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请填写入队密码"
          :rules="[{ required: true, message: '请填写密码' }]"
      />
    </van-cell-group>

    <div style="margin: 16px;">
      <van-button round block type="primary" native-type="submit">
        创建
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import {ref} from "vue";
import myAxios from "../../plugins/myAxios";
import {Toast} from "vant";
import {useRouter} from "vue-router";

const router = useRouter();

const initFormData = {
  "name": "",
  "maxNum": 3,
  "expireTime": null,
  "description": "",
  "status": '0',
  "password": ""
};
const addTeamData = ref({...initFormData});

// 展示日期选择器
const showPicker = ref(false);
const minDate = new Date();

const onSubmit = async () => {
  const tempDate = new Date(addTeamData.value.expireTime);
  const postData = {
    ...addTeamData.value,
    expireTime: dateFormat(tempDate),
    status: Number(addTeamData.value.status)
  }
  const res = await myAxios.post("/team/add", postData);
  if (res.data.code === 0 && res.data.data === 1) {
    Toast.success('队伍创建成功');
    await router.push({
      path: '/contacts',
      replace: true
    });
  } else {
    Toast.success('队伍失败');
  }
}

const dateFormat = (timeData: Date) => {
  return timeData.getFullYear() + '-' + (timeData.getMonth() + 1) + '-' + timeData.getDate() + ' ' +
      timeData.getHours() + ':' + timeData.getMinutes() + ':' + timeData.getSeconds();
}

</script>

<style scoped>

</style>