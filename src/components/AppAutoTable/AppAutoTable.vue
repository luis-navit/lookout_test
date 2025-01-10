<template>
  <el-table :data="tableData" style="width: 100%" border>
    <el-table-column
      v-for="(value, index) of tableData[0]"
      :key="`table-column-${index}`"
      :prop="index"
      :label="index"
      width="240"
      sortable
      show-overflow-tooltip
    ></el-table-column>
  </el-table>
</template>

<script setup lang="ts">
  interface IProps {
    tableData: Array<Record<string, any>>
  }

  defineProps<IProps>()
</script>

<style scoped lang="scss" src="./style.scss"></style>
