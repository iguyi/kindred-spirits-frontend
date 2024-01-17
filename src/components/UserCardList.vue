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
          @click="showUser(user.id)"
      >
        查看
      </van-button>
      <van-button
          type="primary"
          size="mini"
          @click="addFriend(user.id)"
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
          <span v-if="user.profile">{{ user.profile.length<10?user.profile:user.profile.substring(0,10)+'...'}}</span>
        </div>
      </div>
    </template>
  </van-cell>

  <van-dialog
      v-model:show="show"
      title="对方详情"
      show-cancel-button
      teleport="body"
      confirm-button-text="添加"
      confirm-button-color="#008080"
      cancel-button-color="#ee0a24"
      theme='round-button'
      @confirm="addFriend(showUserData.id)"
      @close="showDown"
  >
    <van-cell title="昵称" :value="showUserData.username"/>
    <van-cell title="账号" :value="showUserData.userAccount"/>
    <van-cell title="性别" :value="showUserData.gender===0?'男':'女'"/>
    <van-cell title="标签">
      <template #label>
        <van-tag
            type="success"
            v-for="tag in showUserData.tags"
            style="margin-right: 3px"
        >
          {{ tag }}
        </van-tag>
      </template>
    </van-cell>
    <van-cell title="个人简介" :label="showUserData.profile"/>
  </van-dialog>
</template>

<script setup lang="ts">
import {UserType} from "../models/user";
import myAxios from "../plugins/myAxios";
import {Toast} from "vant";
import {ref} from "vue";

/**
 * 添加好友
 *
 * @param targetUserId - 目标用户 id
 */
const addFriend = async (targetUserId: number) => {
  const resultData = await myAxios.post("/friend/apply", {
    receiverId: targetUserId,
    messageType: 1
  });

  if (resultData.data.code === 0) {
    Toast.success("等待对方同意");
  } else {
    Toast.fail(resultData.data.description);
  }
}

/**
 * 被查看用户的详细数据
 */
const showUserData = ref({});

/**
 * 是否展示用户详细数据
 */
const show = ref(false);

/**
 * 查看用户详细详细
 *
 * @param userId - 用户 id
 */
const showUser = async (userId: number) => {
  let result = await myAxios.get('/user/search/id', {
    params: {
      id: userId
    }
  });

  if (!result || result.data.code !== 0) {
    Toast.fail("查询错误");
    return;
  }

  result.data.data.tags = JSON.parse(result.data.data.tags);
  showUserData.value = result.data.data;

  show.value = true;
}

const showDown = () => {
  showUserData.value = {};
}

interface UserCardListProps {
  userList: UserType[];
}

const props = withDefaults(defineProps<UserCardListProps>(), {
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