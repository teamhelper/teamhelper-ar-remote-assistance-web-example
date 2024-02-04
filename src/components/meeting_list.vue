<template>
  <div class="meeting-list">
    <template v-for="(item, index) in meetingListData">
      <div class="meeting-item" :key="`meeting_${index}`" @click="handleJoin(item)">
        <div class="meeting-item-i">
          <span>会议名称：{{ item.meetingName }}</span>
        </div>
        <div class="meeting-item-i">
          <span><strong>会议号：{{ item.meetingNo }}</strong></span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'meetingList',
  props: ['THMKitEvent'],
  data() {
    return {
      meetingListData: []
    }
  },
  mounted() {
    this.handleGetMeetingListData()
  },
  methods: {
    handleGetMeetingListData: async function () {
      const meetingRes = await this.THMKitEvent.getMeetingList()
      if (meetingRes.code != 200) {
        this.$message.error(meetingRes.msg)
        return false
      }
      this.meetingListData = meetingRes.data
    },
    handleJoin: function (row) {
      this.$emit('handleJoin', row)
    }
  }
}
</script>

<style lang="scss" scoped>
.meeting-list {
  width: 100%;
  height: 400px;
  overflow: hidden;
  overflow-y: scroll;
  cursor: pointer;

  .meeting-item {
    width: calc(100% - 20px - 10px);
    height: 60px;
    background: rgba($color: #F5F7FA, $alpha: 1);
    display: flex;
    flex-direction: column;
   justify-content: center;
    margin: 5px;
    padding: 10px 10px;
    border-radius: 5px;
    .meeting-item-i {
      margin:5px 0;
    }
  }
}
</style>
