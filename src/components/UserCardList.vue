<template>
  <van-cell
      v-for="user in userList"
      center
  >
    <template #right-icon>
    </template>
    <!--  添加好友  -->
    <template #extra>
      <van-button
          type="primary"
          size="mini"
          @click="view"
      >
        查看
      </van-button>
      <van-button
          type="primary"
          size="mini"
          @click="addUser"
      >
        添加
      </van-button>

    </template>
    <template #default>
      <div class="custom-cell">
        <!-- 头像 -->
        <div>
          <van-image
              round
              width="80px"
              height="80px"
              :src="user.avatarUrl"
          />
        </div>
        <!-- 用户信息 -->
        <div style="margin-left: 5px">
          <span class="custom-title">{{ user.username }}</span><br>
          <van-tag class="custom-tag"
                   v-for="tag in user.tags"
                   type="danger"
          >
            {{ tag }}
          </van-tag>
          <br>
          <span>{{ user.profile }}</span>
        </div>
      </div>
    </template>
  </van-cell>
</template>

<script setup lang="ts">
import {UserType} from "../models/user";

interface UserCardListProps {
  userList: UserType[];
}

const props = withDefaults( defineProps<UserCardListProps>(), {
  // @ts-ignore
  userList: [] as UserType[],
});
</script>

<style scoped>
.custom-cell {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}

.custom-title {
  font-weight: bold;
  margin-top: 0;
  margin-right: 4px;
  vertical-align: middle;
  font-size: 28px;
}

.custom-tag {
  margin-right: 4px;
  vertical-align: middle;
  font-size: 10px;
}
</style>