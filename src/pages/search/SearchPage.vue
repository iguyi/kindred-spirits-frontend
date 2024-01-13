<template>
  <!-- 顶部 -->
  <van-nav-bar
      v-if="!$route.meta.navBar"
      :title="$route.meta.title"
      left-arrow
      @click-left="onClickLeft"
      class="custom-navbar"
  >
    <template #left>
      <van-icon name="arrow-left" size="18"/>
    </template>
  </van-nav-bar>

  <van-tabs v-model:active="active" @click-tab="onClickTab">
    <van-tab title="标签搜索">
      <form action="/public">
        <van-search
            v-model="searchText"
            show-action
            placeholder="请输入搜索标签"
            @search="onSearch"
            @cancel="onCancel"
            @focus="isRequest(false)"
            @blur="isRequest(true)"
        >
          <template #action>
            <div style="padding-bottom: 5px">
              <van-button
                  v-if="!request"
                  icon="search"
                  type="primary"
                  size="small"
                  color="green"
                  @click="onSearch"
              />
              <van-button
                  v-if="request"
                  icon="search"
                  type="primary"
                  size="small"
                  @click="toSearchResult"
              />
            </div>
          </template>
        </van-search>
      </form>
      <van-divider
          :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }"
      >
        已选标签
        <div style="padding-bottom: 5px">
          <van-button
              icon="delete"
              type="primary"
              size="mini"
              color="red"
              style="margin-left: 5px"
              @click="closeAll"
          />
        </div>
      </van-divider>
      <div v-if="activeIds.length === 0" class="van-ellipsis" style="padding-left: 20px; color: rgb(92, 139, 250)">
        暂未选择搜索标签
      </div>
      <van-row gutter="16" style="padding: 0 16px">
        <van-col v-for="tag in activeIds">
          <van-tag closeable size="small" type="primary" @close="doClose(tag)">
            {{ tag }}
          </van-tag>
        </van-col>
      </van-row>

      <!-- 可选标签 -->
      <van-divider
          :style="{ color: '#1989fa', borderColor: '#1989fa', padding: '0 16px' }"
      >
        可选标签
      </van-divider>
      <van-tree-select
          v-model:active-id="activeIds"
          v-model:main-active-index="activeIndex"
          :items="tagList"
      />
    </van-tab>

    <van-tab title="自由搜索">
      <form action="/public">
        <van-search
            v-model="searchText"
            show-action
            placeholder="请输入标签/昵称/队伍/关键词/关键词"
            @search="dofSearch"
        >
          <template #action>
            <div>
              <van-button
                  icon="search"
                  type="primary"
                  size="small"
                  block="block"
                  @click="dofSearch"
              />
            </div>
          </template>
        </van-search>
      </form>
    </van-tab>
  </van-tabs>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter} from "vue-router";

const router = useRouter();

const onClickLeft = () => {
  router.back();
};

// 可选标签列表 - 源数据
let originTagList = [
  {
    text: '方向',
    children: [
      {text: 'Java', id: 'Java'},
      {text: 'Python', id: 'Python'},
      {text: 'C++', id: 'C++'},
      {text: 'go', id: 'go'},
      {text: '前端', id: '前端'},
      /*{text: 'C++', id: 'C++', disabled: true},*/
    ],
  },
  {
    text: '性别',
    children: [
      {text: '男', id: '男'},
      {text: '女', id: '女'},
    ],
  },
];

// 可选标签列表
let tagList = ref(originTagList);

/**
 * 搜索条件过滤
 *
 * @param val
 */
const onSearch = (val) => {
  tagList.value = originTagList.map(parentTag => {
    // 克隆一份原始数据
    const tempChildren = [...parentTag.children];
    const tempParentTag = {...parentTag};
    tempParentTag.children = tempChildren.filter(item => item.text.includes(searchText.value));
    return tempParentTag;
  });
};

// 搜索内容
const searchText = ref('');

/**
 * 取消, 清空搜索框中的内容
 * 只对标签搜索有效
 */
const onCancel = () => {
  searchText.value = '';
  tagList.value = originTagList;
};

// 已选中的标签的消息
const activeIds = ref([]);
const activeIndex = ref(0);

/**
 * 移除已选标签
 * @param tag - 已选标签
 */
const doClose = (tag) => {
  activeIds.value = activeIds.value.filter(item => item !== tag);
};

/**
 * 清空所有已选标签
 */
const closeAll = () => {
  if (activeIds.value.length === 0) {
    return;
  }
  activeIds.value.forEach(item => doClose(item));
}

/**
 * 在 "按标签搜索模式" 下:
 * 1）request 为 true 表示当按下搜索按钮时, 向后端发送搜索请求
 * 2）request 为 false 表示当按下搜索按钮时, 找到符合要求的标签供用户选择
 *
 * @type {Ref<UnwrapRef<boolean>>}
 */
const request = ref(true);

/**
 * 在 "按标签搜索模式" 下:
 * 1）当焦点在搜索框内, 将 request 设置为 false
 * 2）当焦点离开搜索框, 将 request 设置为 true
 *
 * @param flag
 */
const isRequest = (flag) => {
  // 延迟 1 ms 执行, 避免点击按钮马上改变搜索状态的问题
  setTimeout(() => {
    request.value = flag;
  }, 1);
}

/**
 * 标签搜索 - 跳转至 "搜索结果页"
 */
const toSearchResult = () => {
  router.push({
    path: '/search/result',
    query: {
      tags: activeIds.value
    }
  });
}

/**
 * 自由搜索 - 跳转至 "搜索结果页"
 */
const dofSearch = () => {
  alert(searchText.value);
}
</script>

<style scoped>
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
}
</style>