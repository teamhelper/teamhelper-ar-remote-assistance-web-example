<template>
  <div class="meeting-list">
    <template v-for="(item, index) in meetingListData">
      <div
        class="meeting-item"
        :key="`meeting_${index}`"
        @click="handleJoin(item)"
      >
        <span>会议名称：{{ item.meetingNo }}</span>
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
  height: 100%;
  overflow: hidden;
  overflow-y: scroll;
  cursor: pointer;
  .meeting-item {
    width: calc(100% - 20px - 10px);
    height: 60px;
    background: rgba($color: #4f4e4e, $alpha: 0.4);
    display: flex;
    align-items: center;
    margin: 5px;
    padding: 0 10px;
    border-radius: 5px;
  }
}
</style>
