<template>
  <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
  >
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
          <span class="custom-title">
            {{ user.username.length <= 11 ? user.username : user.username.substring(0, 8) + '...' }}
          </span><br>
            <van-tag class="custom-tag"
                     v-for="(tag, index) in displayedTags(user.tags)" :key="index"
                     type="danger"
            >
              {{ tag }}
            </van-tag>
            <br>
            <span
                v-if="user.profile">{{
                user.profile.length < 10 ? user.profile : user.profile.substring(0, 10) + '...'
              }}
          </span>
          </div>
        </div>
      </template>
    </van-cell>
  </van-list>

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
    <ShowUser :user="showUserData"/>
  </van-dialog>
</template>

<script setup lang="ts">
import {UserType} from "../models/user";
import myAxios from "../plugins/myAxios";
import {Toast} from "vant";
import {ref} from "vue";
import ShowUser from "./ShowUser.vue";
import {userCarType} from "../states/userCar";
import {basePageSize} from "../config/page";
import qs from "qs";

// 列表相关参数
const loading = ref(false);
const finished = ref(false);
const pageNum = ref(2);  // 初始页数为 2, 因为首次展示的数据是第一页的数据

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
 * 查看用户详细信息
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

const displayedTags = (tags: string[]) => {
  if (tags === null) {
    return [];
  }
  return tags.slice(0, 4);
};

/**
 * 异步加载数据
 */
const onLoad = async () => {
  // 最佳推荐
  if (props.flushPath === userCarType.match) {
    loading.value = false;
    finished.value = true;
    return;
  }

  // 记录数据
  let userListData = null;

  if (props.flushPath === userCarType.searchUserByTag) {
    // 标签搜索
    userListData = await myAxios.get(props.flushPath, {
      params: {
        tagNameList: props.tagNameList,
        pageSize: basePageSize,
        pageNum: pageNum.value
      },
      paramsSerializer: params => {
        // opts: arg[0]=1&arg[1]=2
        return qs.stringify(params, {indices: false});
      }
    }).then(function (response) {
      loading.value = false;
      console.log(`${props.flushPath} succeed. ${response}`);
      return response.data?.data;
    }).catch(function (error) {
      loading.value = false;
      console.log(`{props.flushPath} error. ${error}`);
      Toast.fail('系统繁忙');
      return;
    });
  } else if (props.flushPath === userCarType.searchUserByFree) {
    // 自由搜索
    userListData = await myAxios.get(props.flushPath, {
      params: {
        searchCondition: props.searchCondition,
        pageSize: basePageSize,
        pageNum: pageNum.value
      },
    }).then(function (response) {
      loading.value = false;
      console.log(`${props.flushPath} succeed. ${response}`);
      return response.data?.data;
    }).catch(function (error) {
      loading.value = false;
      console.log(`{props.flushPath} error. ${error}`);
      Toast.fail('系统繁忙');
      return;
    });
  } else if (props.flushPath === userCarType.recommend) {
    // 普通匹配
    userListData = await myAxios.get(props.flushPath, {
      params: {
        pageSize: basePageSize,
        pageNum: pageNum.value
      },
    }).then(function (response) {
      loading.value = false;
      console.log(`${props.flushPath} succeed. ${response}`);
      return response.data?.data;
    }).catch(function (error) {
      loading.value = false;
      console.log(`{props.flushPath} error. ${error}`);
      Toast.fail('系统繁忙');
      return;
    });
  }

  if (userListData === null || userListData.length === 0) {
    // 无数据可加载
    loading.value = false;
    finished.value = true;
    return;
  }
  userListData.forEach(user => {
    if (user.tags) {
      user.tags = JSON.parse(user.tags);
    }
    props.userList.push(user);
  });
  pageNum.value = pageNum.value + 1;
  loading.value = false;
};

interface UserCardListProps {
  userList: UserType[];
  flushPath: string;
  searchCondition: string;
  tagNameList: string[];
}

const props = withDefaults(defineProps<UserCardListProps>(), {
  // @ts-ignore
  userList: [] as UserType[],
  flushPath: '' as string,
  searchCondition: "" as string,
  tagNameList: (props: UserCardListProps) => {
    return [];
  }
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