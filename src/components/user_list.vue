<template>
  <div class="custom-invite-list">
    <template v-for="(item, index) in userListData">
      <div class="user-item" :key="`user_${index}`" @click="handleInvite(item)" v-if="userInfo.userId != item.userId">
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
      const curList = this.THMKitEvent.getMeetingRoomPsnList()
      const psnRes = await this.THMKitEvent.getUserList()
      if (psnRes.code != 200) {
        this.$message.error(psnRes.msg)
        return false
      }
      const allList = psnRes.data
      if (allList && curList && allList.length > 0) {
        this.userListData = allList.filter(itemA => !curList.some(itemB => itemB.userId == itemA.userId));
      } else {
        this.userListData = psnRes.data
      }
    },
    handleInvite: function (row) {
      this.$emit('handleInvite', row)
    },
  }
}
</script>

<style lang="scss" scoped>
.custom-invite-list {
  width: 100%;
  max-height: 300px;
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
