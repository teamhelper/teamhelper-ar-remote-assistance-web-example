<template>
  <div class="subscribe">
    <el-form ref="form" :model="form">
      <el-form-item :label="`*会议名称`">
        <el-input size="small" v-model="form.meetingName" :placeholder="`会议名称`"></el-input>
      </el-form-item>
      <el-form-item :label="`*开始时间`">
        <el-date-picker v-model="form.startTime" size="small" type="datetime" :placeholder="`开始时间`" align="right"
          value-format="timestamp">
        </el-date-picker>
      </el-form-item>
      <el-form-item :label="`*会议时长`">
        <el-input-number v-model="form.hour" size="small" :min="0" :max="23" :step="1"></el-input-number>
        <span>小时</span>
        <el-input-number v-model="form.minute" size="small" :min="0" :max="55" :step="5"></el-input-number>
        <span>分钟</span>
      </el-form-item>
      <el-form-item label="会议参与人">
        <el-select v-model="form.inviteeUserIds" size="small" filterable :multiple="true" placeholder="参与人">
          <el-option v-for="item in userListData" :key="item.userId" :value="item.userId"
            :label="`用户名称： ${item.nickname}   userId: ${item.userId}`">
            <template>
              <div class="inviteeItem">
                <span>用户名称：{{ item.nickname }}</span>
                <span> userId: {{ item.userId }}</span>
              </div>
            </template>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" @click="handleSave"> 创建预约会议 </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'userList',
  props: ['THMKitEvent', 'userInfo'],
  data() {
    return {
      userListData: [],
      form: {
        meetingName: '',
        hour: 0,
        minute: 30,
        inviteeUserIds: [],
        experience: 0
      },
      meetingList: []
    }
  },
  mounted() {
    this.handleGetUserListData()
  },
  methods: {
    handleGetUserListData: async function () {
      const psnRes = await this.THMKitEvent.getUserList()
      if (psnRes.code != 200) {
        this.$message.error(psnRes.msg)
        return false
      }
      this.userListData = psnRes.data
    },
    handleSave: async function () {
      const meetingName = !this.form.meetingName
        ? ''
        : this.form.meetingName.replace(/\s+/g, '')
      if (!meetingName) {
        this.$message.error('请输入会议名称中')
        return false
      }
      if (!this.form.startTime) {
        this.$message.error('请输入会议开始时间')
        return false
      }
      if (!this.form.hour && !this.form.minute) {
        this.$message.error('请会议时长')
        return false
      }
      const res = await this.THMKitEvent.createMeeting({
        ...this.form
      })
      if (res.code != 200) {
        this.$message.error(res.msg)
        return false
      }
      this.$message.success('会议创建成功，请在会议列表中进行查看，并加入会议')
    }
  }
}
</script>

<style lang="scss" scoped>
.subscribe {
  width: 100%;
  height: 100%;
  overflow: hidden;
  overflow-y: scroll;
  cursor: pointer;

  .list {
    height: 400px;
    overflow: hidden;
    overflow-y: scroll;
  }

  .list-item {
    width: calc(100% - 20px - 10px);
    height: 60px;
    background: rgba($color: #F5F7FA, $alpha: 1);
    display: flex;
    align-items: center;
    margin: 5px;
    padding: 0 10px;
    border-radius: 5px;
  }
}
</style>
