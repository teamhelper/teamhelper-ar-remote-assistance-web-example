<template>
  <div class="user-list">
    <template v-for="(item, index) in userListData">
      <div
        class="user-item"
        :key="`user_${index}`"
        @click="handleCall(item)"
        v-if="userInfo.userId != item.userId"
      >
        {{ item.nickname }}- userId: {{ item.userId }}
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'userList',
  props: ['THMKitEvent', 'userInfo'],
  data() {
    return {
      userListData: []
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
    handleCall: function (row) {
      this.$emit('handleCall', row)
    }
  }
}
</script>

<style lang="scss" scoped>
.user-list {
  width: 100%;
  height: 100%;
  overflow: hidden;
  overflow-y: scroll;
  cursor: pointer;
  .user-item {
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
