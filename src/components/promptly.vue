<template>
  <div class="promptly">
    <el-form ref="form" :model="form">
      <el-form-item :label="`*会议名称`">
        <el-input size="small" v-model="form.meetingName" :placeholder="`会议名称`"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" @click="handlePromptlyMeeting"> 立即会议 </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'promptlyVue',
  props: ['THMKitEvent'],
  data() {
    return {
      form: {
        meetingName: '',
      },
    }
  },
  mounted() {
  },
  methods: {
    handlePromptlyMeeting: async function () {
      if (!this.form.meetingName) {
        this.$message.error('请输入会议名称')
        return false
      }
      const res = await this.THMKitEvent.createMeeting({
        meetingName: this.form.meetingName,
        startTime: '',
        hour: '',
        minute: '',
        inviteeUserIds: [],
        experience: 0
      })
      if (res.code != 200) {
        this.$message.error(res.msg)
        return false
      }
      this.$emit('handleJoinMeeting', res.data)
    }
  }
}
</script>

<style lang="scss" scoped>
.promptly {
  width: 100%;
  height: 100%;
  overflow: hidden;
  overflow-y: scroll;
  cursor: pointer;
}
</style>
