<template xmlns="http://www.w3.org/1999/html">
  <!-- 顶部 -->
  <van-nav-bar
      v-if="!$route.meta.navBar"
      :title="teamDetail.name"
      left-arrow
      @click-left="onClickLeft"
      class="custom-navbar"
  >
    <template #left>
      <van-icon name="arrow-left" size="18"/>
    </template>
  </van-nav-bar>

  <template v-if="teamDetail !== {}">
    <!-- 队伍头像   -->
    <van-cell is-link center>
      <template #title>
        <div style="font-size: 15px">头像</div>
      </template>
      <van-image
          round
          width="48px"
          height="48px"
          :src="teamDetail.avatarUrl"
      />
    </van-cell>

    <!--  队伍名称 -->
    <van-cell center is-link>
      <template #title>
        <div style="font-size: 15px">队伍名称</div>
      </template>
      <template #value>
        <div style="font-size: 15px">
          {{ `${teamDetail.name}  ` }}
          <van-tag v-if="teamDetail.status === 0" round size="mini" type="success">公开</van-tag>
          <van-tag v-if="teamDetail.status === 1" round size="mini" type="danger">私有</van-tag>
          <van-tag v-if="teamDetail.status === 2" round size="mini" type="warning">加密</van-tag>
        </div>
      </template>
    </van-cell>

    <!-- 队伍介绍   -->
    <van-cell is-link>
      <template #title>
        <div style="font-size: 15px">队伍介绍</div>
      </template>
      <template #label>
        <div style="font-size: 15px">
          {{ teamDetail.description }}
        </div>
      </template>
    </van-cell>

    <!-- 入队链接   -->
    <van-cell>
      <template #title>
        <div style="font-size: 15px">邀请码</div>
      </template>
      <template #label>
        <div style="font-size: 15px; margin-right: 5px">{{ teamDetail.teamLink ?? "无" }}</div>
      </template>
      <template #extra>

        <van-button round size="mini" type="success" icon="link-o" @click="copy"/>
        <van-button round size="mini" type="success" icon="replay" @click="refreshTeamLink"/>
      </template>
    </van-cell>

    <!-- 入队截至时间   -->
    <van-cell>
      <template #title>
        <div style="font-size: 15px">入队截至时间</div>
      </template>
      <template #value>
        <div style="font-size: 15px; margin-right: 10px">{{ teamDetail.expireTime }}</div>
      </template>
    </van-cell>

    <!-- 队伍成员   -->
    <van-collapse v-model="activeNames">
      <van-collapse-item :title="`队伍成员(剩余 ${teamDetail.maxNum-teamDetail.num} 个位置)`" name="1">
        <van-cell v-for="user in teamDetail.userList">
          <template #value>
            <div class="custom-cell">
              <div>
                <van-image
                    round
                    width="35px"
                    height="35px"
                    :src="user.avatarUrl"
                />
              </div>
              <div style="margin-left: 5px">
                <span class="custom-title">{{ user.username }}</span><br>
                <span class="custom-tag">
                  <van-tag
                      type="primary"
                      v-if="user.id === teamDetail.userId"
                      style="margin-left: 3px; margin-right: 3px"
                  >
                    建队
                  </van-tag>
                  <van-tag
                      type="primary"
                      v-if="user.id === teamDetail.leaderId"
                      style="margin-left: 3px; margin-right: 3px"
                  >
                    队长
                  </van-tag>
                  <van-tag
                      type="primary"
                      v-if="user.id !== teamDetail.userId && user.id !== teamDetail.leaderId"
                      style="margin-left: 3px; margin-right: 3px"
                  >
                    队员
                  </van-tag>
                </span>
              </div>
            </div>
          </template>

          <template #extra>
            <van-button
                v-if="currentUser.id !== user.id"
                @click="show(user.id)"
                size="mini"
                type="success"
            >
              查看
            </van-button>
            <van-button
                v-if="currentUser.id === teamDetail.leaderId && currentUser.id !== user.id"
                @click="abdicator(user.id)"
                size="mini"
                type="warning"
            >
              让位
            </van-button>
            <van-button
                v-if="currentUser.id === teamDetail.leaderId && currentUser.id !== user.id"
                @click="kickOut(user.id)"
                size="mini"
                type="danger"
            >
              移出
            </van-button>
            <van-button
                v-if="currentUser.id === user.id"
                @click="quit()"
                size="mini"
                type="danger"
            >
              退出
            </van-button>
          </template>
        </van-cell>
      </van-collapse-item>
    </van-collapse>

    <!-- 创建时间   -->
    <van-cell>
      <template #title>
        <div style="font-size: 15px">创建时间</div>
      </template>
      <template #value>
        <div style="font-size: 15px; margin-right: 10px">{{ teamDetail.createTime }}</div>
      </template>
    </van-cell>
  </template>

</template>

<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import myAxios from "../../plugins/myAxios";
import {Toast} from "vant";
import {getCurrentUser} from "../../services/user";
import {webSocketCache} from "../../states/chat";
import {UserType} from "../../models/user";

const router = useRouter();
const route = useRoute();

const teamDetail = ref({id: -1});

const activeNames = ref(['1']);

// 当前登录用户
const currentUser = ref<UserType>();

onMounted(async () => {
  currentUser.value = await getCurrentUser();

  const {teamId} = route.query;
  const teamMessage = await myAxios.get("/team/check", {
    params: {
      teamId: Number(teamId)
    }
  });
  if (!teamMessage || teamMessage.data.code !== 0) {
    Toast.fail(teamMessage.data.description);
    return;
  }
  teamDetail.value = teamMessage.data.data;
});

/**
 * 更新入队邀请
 */
const refreshTeamLink = async () => {
  const res = await myAxios.get("/team/link", {
    params: {
      teamId: teamDetail.value.id
    }
  });
  if (res && res.data.code === 0 && res.data.data) {
    teamDetail.value.teamLink = res.data.data;
    Toast.success("更新成功");
    return;
  }
  Toast.fail(res.data.description);
}

/**
 * todo 查看其他队员
 *
 * @param id - 被查看队员的 id
 */
const show = (id: number) => {
  Toast.success(`todo 对方 id ${id}`);
}

/**
 * 队长位置转让
 *
 * @param id - 被任命为队长的用户的 id
 */
const abdicator = async (id: number) => {
  const res = await myAxios.post('/team/abdicator', {
    memberId: id,
    teamId: teamDetail.value.id
  });

  if (res && res.data.code === 0 && res.data.data === true) {
    teamDetail.value.leaderId = id;
    Toast.success("操作成功");
    return;
  }
  Toast.fail(res.data.description);
}

/**
 * 踢人
 *
 * @param id - 被移出队伍者的 id
 */
const kickOut = async (id: number) => {
  const res = await myAxios.post('/team/kick', {
    memberId: id,
    teamId: teamDetail.value.id
  });

  if (res && res.data.code === 0 && res.data.data === true) {
    teamDetail.value.userList = teamDetail.value.userList.filter(user => user.id !== id);
    teamDetail.value.num = teamDetail.value.num - 1;
    Toast.success('操作成功');
    return;
  }
  Toast.fail(res.data.description);
}

/**
 * 退出队伍
 */
const quit = async () => {
  const res = await myAxios.post('/team/quit', {
    'teamId': teamDetail.value.id
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (res && res.data.code === 0 && res.data.data === true) {
    let socketKey = `${currentUser.value.id}-${teamDetail.value.id}`
    let teamChatMap = webSocketCache.teamChatMap;
    if (teamChatMap.hasOwnProperty(socketKey)) {
      await teamChatMap[socketKey].close();
      delete teamChatMap[socketKey];
    }
    Toast.success('已退出队伍');
    await router.push('/');
    return;
  }

  Toast.fail(`${res.data.description}`);
}

/**
 * 回退
 */
const onClickLeft = () => {
  router.back();
}
import copyToClipboard from 'clipboard-copy';
const copy =  async () => {
  try {
    await copyToClipboard(teamDetail.value.teamLink);
    Toast.success("邀请码已复制");
  } catch (err) {
    Toast.fail("复制失败");
    console.error('无法复制', err);
  }
}

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
  font-size: 20px;
}

.custom-tag {
  margin-right: 4px;
  vertical-align: middle;
}
</style>