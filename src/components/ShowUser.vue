<template>
  <van-cell title="昵称" :value="user.username"/>
  <van-cell title="账号" :value="user.userAccount"/>
  <van-cell title="性别" :value="user.gender===0?'男':'女'"/>
  <van-cell title="标签">
    <template #label>
      <van-tag
          type="success"
          v-for="tag in user.tags"
          style="margin-right: 3px"
      >
        {{ tag }}
      </van-tag>
    </template>
  </van-cell>
  <van-cell title="个人简介" :label="user.profile"/>
</template>

<script setup lang="ts">
import {UserType} from "../models/user";

interface ShowUserProps {
  user: UserType;
}

const props = withDefaults(defineProps<ShowUserProps>(), {
  // @ts-ignore
  user: {} as UserType,
});
</script>

<style scoped>

</style>