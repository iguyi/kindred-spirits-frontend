// 定义路由
import HomePage from '../pages/HomePage.vue';
import ContactsPage from '../pages/ContactsPage.vue';
import AddPage from '../pages/AddPage.vue';
import SettingPage from '../pages/SettingPage.vue';
import SearchPage from '../pages/search/SearchPage.vue';
import SearchResultPage from '../pages/search/SearchResultPage.vue';
import UserLoginPage from '../pages/user/UserLoginPage.vue';
import CreatePage from '../pages/team/CreatePage.vue'
import JoinPage from '../pages/team/JoinPage.vue'
import TeamHomePage from '../pages/team/TeamHomePage.vue'
import EditUsernamePage from '../pages/edit/user/EditUsernamePage.vue'
import EditProfilePage from '../pages/edit/user/EditProfilePage.vue'
import EditGenderPage from '../pages/edit/user/EditGenderPage.vue'
import EditPhonePage from '../pages/edit/user/EditPhonePage.vue'
import EditEmailPage from '../pages/edit/user/EditEmailPage.vue'
import EditTagPage from '../pages/edit/user/EditTagPage.vue'
import EditAvatarPage from '../pages/edit/user/EditAvatarPage.vue'
import EditPwdPage from '../pages/edit/user/EditPwdPage.vue'
import PrivateChatRoomPage from '../pages/room/PrivateChatRoomPage.vue'
import TeamChatRoomPage from '../pages/room/TeamChatRoomPage.vue'

const routes = [
    {path: '/', component: HomePage, meta: {navBar: true, vanTabbar: true, title: '聊天'}},
    {path: '/contacts', component: ContactsPage, meta: {navBar: true, vanTabbar: true, title: '通讯录'}},
    {path: '/add', component: AddPage, meta: {navBar: true, vanTabbar: true, title: '匹配伙伴/队伍'}},
    {path: '/setting', component: SettingPage, meta: {navBar: true, vanTabbar: true, title: '设置'}},
    {path: '/search', component: SearchPage, meta: {navBar: false, vanTabbar: true, title: '搜索'}},
    {
        path: '/search/result',
        component: SearchResultPage,
        meta: {navBar: true, vanTabbar: true, result: true, title: '搜索结果'}
    },
    {path: '/user/login', component: UserLoginPage, meta: {navBar: false, vanTabbar: false, title: '登录'}},
    {path: '/team/create', component: CreatePage, meta: {navBar: true, vanTabbar: false, title: '创建队伍'}},
    {path: '/team/join', component: JoinPage, meta: {navBar: false, vanTabbar: false, title: '加入队伍'}},
    {path: '/team/home', component: TeamHomePage, meta: {navBar: false, vanTabbar: false, title: '队伍主页'}},
    {path: '/edit/user/username', component: EditUsernamePage, meta: {navBar: false, vanTabbar: false, title: '编辑-昵称'}},
    {path: '/edit/user/profile', component: EditProfilePage, meta: {navBar: false, vanTabbar: false, title: '编辑-简介'}},
    {path: '/edit/user/gender', component: EditGenderPage, meta: {navBar: false, vanTabbar: false, title: '编辑-性别'}},
    {path: '/edit/user/phone', component: EditPhonePage, meta: {navBar: false, vanTabbar: false, title: '编辑-手机号'}},
    {path: '/edit/user/email', component: EditEmailPage, meta: {navBar: false, vanTabbar: false, title: '编辑-邮箱'}},
    {path: '/edit/user/avatar', component: EditAvatarPage, meta: {navBar: false, vanTabbar: false, title: '编辑-头像'}},
    {path: '/edit/user/tag', component: EditTagPage, meta: {navBar: false, vanTabbar: false, title: '编辑-标签'}},
    {path: '/edit/user/pwd', component: EditPwdPage, meta: {navBar: false, vanTabbar: false, title: '编辑-密码'}},
    {path: '/chat/private', component: PrivateChatRoomPage, meta: {navBar: false, vanTabbar: false, title: '好友聊天'}},
    {path: '/chat/team', component: TeamChatRoomPage, meta: {navBar: false, vanTabbar: false, title: '队伍聊天'}},
]

export default routes;
