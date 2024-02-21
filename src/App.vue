<template>
  <div id="app">
    <div class="left">
      <div class="left-title">
        <span>登录THMKit</span>
      </div>
      <div class="left-desc">
        快速体验请使用不同浏览器，输入开发者平台中应用信息及用户UserId进行登录
      </div>
      <!-- 登录THMKit 入参 -->
      <div class="login-container">
        <el-form ref="form" :model="loginParams" label-position="top" size="small">
          <el-form-item label="userId">
            <el-input v-model="loginParams.userId" placeholder="用户id"></el-input>
          </el-form-item>
          <el-form-item label="appKey">
            <el-input v-model="loginParams.appKey" placeholder="开发者平台 应用 appKey"></el-input>
          </el-form-item>
          <el-form-item label="accessKey">
            <el-input v-model="loginParams.accessKey" placeholder="开发者平台 应用 accessKey"></el-input>
          </el-form-item>
          <el-form-item label="accessSecret">
            <el-input v-model="loginParams.accessSecret" placeholder="开发者平台 应用 accessSecret"></el-input>
          </el-form-item>
          <el-form-item label="timestamp">
            <el-date-picker type="date" placeholder="token失效时间" v-model="loginParams.timestamp" value-format="timestamp"
              style="width: 100%"></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUseLogin">登录</el-button>
            <el-button @click="handleUseLoginOut">退出登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right">
      <div class="right-desc">
        <strong>您可以根据不同业务场景，进行体验</strong>
        <br /> <strong>1、预约会议场景：</strong>
        <br /> 点击“预约会议”: 输入您预约会议的信息
        <br /> 进入“会议列表”：点击“会议” 进行会议协作
        <br /><strong>2、立即会议场景：</strong>
        <br /> 点击“立即会议”：输入您的会议名称，进行会议协作
        <br /><strong>3、加入会议场景：</strong>
        <br /> 点击“会议列表”：选择会议，进行会议协作
        <br /><strong>4、呼叫人员场景：</strong>
        <br /> 点击“人员列表”：点击人员列表中的人员，进行会议协作
      </div>
      <template v-if="userInfo">
        <el-tabs v-model="activeName" @tab-click="handleChangeAccessMode">
          <el-tab-pane label="预约会议" name="subscribe">
            <template v-if="activeName == 'subscribe'">
              <subscribe-vue ref="subscribeRef" :THMKitEvent="$THMKit"></subscribe-vue>
            </template>
          </el-tab-pane>
          <el-tab-pane label="立即会议" name="promptly">
            <template v-if="activeName == 'promptly'">
              <promptly-vue ref="promptlyRef" :THMKitEvent="$THMKit"
                @handleJoinMeeting="handleJoinMeeting"></promptly-vue>
            </template>
          </el-tab-pane>
          <el-tab-pane label="呼叫人员" name="user">
            <template v-if="activeName == 'user'">
              <user-list ref="userListRef" :userInfo="userInfo" :THMKitEvent="$THMKit"
                @handleCall="handleCalling"></user-list>
            </template>
          </el-tab-pane>
          <el-tab-pane label="会议列表" name="meeting">
            <template v-if="activeName == 'meeting'">
              <meeting-list ref="meetingListRef" :THMKitEvent="$THMKit" @handleJoin="handleJoinMeeting"></meeting-list>
            </template>

          </el-tab-pane>
        </el-tabs></template>
    </div>
    <div class="answer-container" v-if="answerProps.answerVisible">
      <THMKitAnswer :answerOptions="answerProps.answerOptions" :THMKitEvent="$THMKit"
        @handleCallAccept="handleAcceptCloseAnswerContainer" @handleCallReject="handleRejectCloseAnswerContainer">
      </THMKitAnswer>
    </div>
    <THMKitAssist v-if="assistProps.assistVisible" :THMKitEvent="$THMKit" :customInvite="assistProps.customInvite"
      @handleOverMeeting="handleOverMeeting" @handleCustomInvite="handleCustomInviteEvent"></THMKitAssist>
    <!-- 自定义会议中协作邀请列表 -->
    <el-dialog title="自定义会议中协作邀请列表" class="selectMemberDialog" :visible.sync="customInviteDialogVisible"
      v-if="customInviteDialogVisible" :modal-append-to-body="false" :destroy-on-close="true"
      :close-on-click-modal="false" :before-close="handleSelectMemberClose">
      <custom-invite-list ref="customInviteListRef" :userInfo="userInfo" :THMKitEvent="$THMKit"
        @handleInvite="handleInvite"></custom-invite-list>
    </el-dialog>
  </div>
</template>

<script>
import { THMKitAssist, THMKitAnswer, THMKit } from 'thmkit'
import Axios from 'axios'
import subscribeVue from './components/subscribe.vue'
import promptlyVue from './components/promptly.vue'
import userList from './components/user_list.vue'
import meetingList from './components/meeting_list.vue'
import customInviteList from './components/custom_invite_list.vue'
export default {
  name: 'App',
  data() {
    return {
      hostUrl: '/api', // nginx 代理 key,
      loginParams: {
        userId: null, // 用户ID
        appKey: '', // 开发者平台 应用appKey
        accessKey: '', // 开发者平台 应用accessKey
        accessSecret: '', // 开发者平台 应用accessSecret
        timestamp: '', // token 失效时间 (毫秒级)
        platform: 'PC' // 平台信息 PC/ANDROID/GLASS
      },
      // 切换加入模式
      activeName: 'subscribe',
      // 应用信息
      applyInfo: null,
      // MST用户信息
      userInfo: null,
      // 等待接听组件相关变量
      answerProps: {
        answerVisible: false, // 是否显示等待接听
        answerOptions: {} // 等待接听组件数据
      },
      // 会议协作组件相关变量
      assistProps: {
        assistVisible: false, // 是否显示会议协作组件
        customInvite: false // 是否开启自定义会议中邀请人列表
      },
      // 会议房间信息
      meetingInfo: null,
      // 自定义会议二次邀请
      customInviteDialogVisible: false
    }
  },
  components: {
    THMKitAssist,
    THMKitAnswer,
    subscribeVue,
    promptlyVue,
    userList,
    meetingList,
    customInviteList
  },
  methods: {
    // 平台用户登录
    handleUseLogin: async function () {
      // 此为示例工程中模拟获取 MST平台信息
      const res = await Axios.post(`${this.hostUrl}/oauth/login/example`, {
        ...this.loginParams
      })
      if (res.data.code != 200) {
        this.$message.error(res.data.msg)
        return false
      }
      this.applyInfo = res.data.data
      this.handleInitTHMKit()
    },
    handleInitTHMKit: async function () {
      try {
        // 根据应用信息实例化ThMeetingSdk
        this.$THMKit = new THMKit({
          userId: this.applyInfo.userId,
          appKey: this.applyInfo.appKey,
          accessKey: this.applyInfo.accessKey,
          signature: this.applyInfo.signature,
          timestamp: this.applyInfo.timestamp,
          platform: this.applyInfo.platform
        }, 'https://developer-test.teamhelper.cn/api', '1.0.0', 'wss://developer-test.teamhelper.cn/im/socket.io')
        // 登录MST-SDK
        const meetingRes = await this.$THMKit.login({
          userId: this.applyInfo.userId
        })
        // 返回用户信息
        this.userInfo = meetingRes.data
        // 注册相关监听事件
        this.handleMonitorTHMKitSdk()
      } catch (error) {
        this.$message.error(error.msg)
      }
    },
    // THMKit监听事件
    handleMonitorTHMKitSdk: function () {
      // webSocket open事件监听回调
      this.$THMKit.addEventListener('wsOpen', this.handleWsOpen)
      // webSocket heartbeat事件监听回调
      this.$THMKit.addEventListener('wsHeartbeat', this.handleWsHeartbeat)
      // webSocket close事件监听回调
      this.$THMKit.addEventListener('wsClose', this.handleWsClose)
      // webSocket error事件监听回调
      this.$THMKit.addEventListener('wsError', this.handleWsError)
      // THMKit 登录成功事件监听回调
      this.$THMKit.addEventListener(
        'THMKit-login-success',
        this.handleTHMkitLoginSuccess
      )
      // THMKit error事件监听回调
      this.$THMKit.addEventListener('THMKit-error', this.handleTHMKitError)
      // THMKit invite事件监听回调
      this.$THMKit.addEventListener('THMKit-invite', this.handleTHMKitInvite)
      // THMKit invite超时事件监听回调
      this.$THMKit.addEventListener(
        'THMKit-invite-timeout',
        this.handleTHMKitInviteTimeout
      )
      // THMKit 其他客户端拒绝事件监听回调
      this.$THMKit.addEventListener(
        'THMKit-other-client-reject',
        this.handleTHMKitOtherClientReject
      )
      // THMKit 其他客户端同意事件监听回调
      this.$THMKit.addEventListener(
        'THMKit-other-client-accept',
        this.handleTHMKitOtherClientAccept
      )
      // THMKit token 即将过期事件监听回调
      this.$THMKit.addEventListener(
        'THMKit-token-will-expire',
        this.handleTHMKitRefreshToken
      )
    },
    handleWsOpen(data) {
      console.log('APP-WebSocket connection opened:', data)
      // Implement your logic here for 'wsOpen' event
    },
    handleWsHeartbeat() {
      // console.log('THMKit WebSocket heartbeat received:', data)
    },
    handleWsClose(data) {
      console.log('THMKit WebSocket connection closed:', data)
      // Implement your logic here for 'wsClose' event
    },
    handleWsError(data) {
      console.error('THMKit WebSocket error:', data)
      // Implement your logic here for 'wsError' event
    },
    handleTHMkitLoginSuccess(data) {
      console.log('THMKit login success:', data)
    },
    handleTHMKitError(data) {
      if (data.reason == 'SAME_PLATFORM_ONLINE') {
        this.$message.error('相同客户端登录')
      } else {
        console.log('THMKit Other error:', data)
      }
    },
    // 接受对方邀请事件
    handleTHMKitInvite(data) {
      this.$set(this.answerProps, 'answerOptions', data)
      this.meetingInfo = data.meetingInfo
      this.$set(this.answerProps, 'answerVisible', true)
    },
    handleTHMKitInviteTimeout: function () {
      this.$message.error(`超时未接听`)
      this.handleCloseAnswerContainer()
    },
    // 接受到其他客户端拒绝
    handleTHMKitOtherClientReject() {
      this.$message.error(`其他客户端已拒绝`)
      this.handleCloseAnswerContainer()
    },
    // 接到其他客户端同意
    handleTHMKitOtherClientAccept() {
      this.$message.error(`其他客户端已同意`)
      this.handleCloseAnswerContainer()
    },
    // 退出登录
    handleUseLoginOut: function () {
      if (typeof this.$THMKit.loginOut === 'function') {
        this.$THMKit.loginOut()
      }
      this.userInfo = null
    },
    // token 即将过期刷新Token
    async handleTHMKitRefreshToken() {
      const res = await Axios.post(`${this.hostUrl}/oauth/login/example`, {
        ...this.loginParams
      })
      if (res.data.code != 200) {
        this.$message.error(res.data.msg)
        return false
      }
      this.applyInfo = res.data.data
      const meetingRes = await this.$THMKit.refreshToken({
        userId: this.applyInfo.userId,
        timestamp: this.applyInfo.timestamp
      })
      if (meetingRes.code != 200) {
        this.$message.error(meetingRes.msg)
        return false
      }
      this.userInfo = meetingRes.data
    },
    // 同意会议
    handleAcceptCloseAnswerContainer: function () {
      this.handleInviterAccept()
      this.handleCloseAnswerContainer()
    },
    // 拒绝会议
    handleRejectCloseAnswerContainer: function (content) {
      console.log('拒绝关闭接听等待页面', content)
      this.handleCloseAnswerContainer()
    },
    // 同意进行协作
    handleInviterAccept: async function () {
      try {
        // 对方同意后，调整用MST业务加入会议接口
        const [resultMeeting] = await this.$THMKit.joinMeeting(
          {
            meetingNo: this.meetingInfo.meetingNo
          }
        )
        // 将当前的会议状态传入ThImAssist 组件
        this.meetingInfo = resultMeeting.data
        this.$set(this.assistProps, 'assistVisible', true) // 进入会议协作
      } catch (error) {
        this.$message.error(error.msg)
      }
    },
    // 关闭接听等待页面
    handleCloseAnswerContainer: function () {
      this.$set(this.answerProps, 'answerVisible', false)
      this.$set(this.answerProps, 'answerOptions', null)
    },
    // 会议结束
    handleOverMeeting: function () {
      this.meetingInfo = {} // 清除会议房间信息
      this.$set(this.assistProps, 'assistVisible', false) // 关闭会议协作
    },
    // 会议中开启邀请列表 - customInvite: true 时生效
    handleCustomInviteEvent: function () {
      this.customInviteDialogVisible = true
    },
    // 切换加入会议模式
    handleChangeAccessMode: function (tab) {
      this.activeName = tab.name
    },
    // 发起呼叫
    handleCalling: async function (item) {
      try {
        const [resultMeeting] = await this.$THMKit.call([item.userId])
        this.meetingInfo = resultMeeting.data // 获取会议房间信息
        this.$set(this.assistProps, 'assistVisible', true) // 进入会议协作
      } catch (error) {
        this.$message.error(error.msg)
      }
    },
    // 加入会议
    handleJoinMeeting: async function (row) {
      try {
        const [resultMeeting] = await this.$THMKit.joinMeeting(
          {
            ...row
          }
        )
        this.meetingInfo = resultMeeting.data
        this.$set(this.assistProps, 'assistVisible', true) // 进入会议协作
      } catch (error) {
        console.log(error)
        this.$message.error(error.msg)
      }
    },
    // 自定义会议二次邀请
    handleInvite: async function (row) {
      this.$THMKit.invite({
        invites: [row.userId],
        meetingNo: this.meetingInfo.meetingNo,
        groupId: this.meetingInfo.groupId
      })
      this.handleSelectMemberClose()
    },
    // 关闭自定义会议二次邀请
    handleSelectMemberClose: function () {
      this.customInviteDialogVisible = false
    },
    // 清除监听
    handleClearListener: function () {
      if (typeof this.$THMKit.removeEventListener === 'function') {
        this.$THMKit.removeEventListener('wsOpen', this.handleWsOpen)
        this.$THMKit.removeEventListener('wsHeartbeat', this.handleWsHeartbeat)
        this.$THMKit.removeEventListener('wsClose', this.handleWsClose)
        this.$THMKit.removeEventListener('wsError', this.handleWsError)
        this.$THMKit.removeEventListener(
          'THMKit-login-success',
          this.handleTHMkitLoginSuccess
        )
        this.$THMKit.removeEventListener('THMKit-error', this.handleTHMKitError)
        this.$THMKit.removeEventListener(
          'THMKit-invite',
          this.handleTHMKitInvite
        )
        this.$THMKit.removeEventListener(
          'THMKit-invite-timeout',
          this.handleTHMKitInviteTimeout
        )
        this.$THMKit.removeEventListener(
          'THMKit-other-client-reject',
          this.handleTHMKitOtherClientReject
        )
        this.$THMKit.removeEventListener(
          'THMKit-other-client-accept',
          this.handleTHMKitOtherClientAccept
        )
        this.$THMKit.removeEventListener(
          'THMKit-token-will-expire',
          this.handleTHMKitRefreshToken
        )
      }
    },
    // 打开预约会议
    handleOpenCreateMeeting: function () {

    },
    // 立即会议
    handleOpenPromptlyMeeting: function () {

    }
  },
  beforeDestroy() {
    this.handleClearListener()
    this.handleUseLoginOut()
  }
}
</script>

<style lang="scss" scoped>
#app {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-around;
  overflow: hidden;
  position: relative;

  .left {
    flex-shrink: 0;
    width: 30%;

    .left-desc {
      margin: 10px 0;

      span {
        font-size: 14px;
      }
    }

    .left-title {
      span {
        font-size: 20px;
        font-weight: bold;
      }
    }

    padding: 10px;
  }

  .right {
    width: 40%;
    padding: 10px;

    .right-desc {
      font-size: 14px;
      line-height: 28px;
    }

    .right-top {
      .right-top-title {
        padding: 10px 0;
      }

      .right-top-m {
        padding: 0 20px 10px;
      }
    }

    .right-title {
      span {
        font-size: 20px;
        font-weight: bold;
      }
    }
  }
}

.th-im-assist-container {
  z-index: 99;
}

.answer-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50px;
  z-index: 99;
}
</style>
