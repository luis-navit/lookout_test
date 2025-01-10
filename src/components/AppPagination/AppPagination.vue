<template>
  <el-pagination
    v-model:current-page="currentPage"
    v-model:page-size="pageSize"
    v-if="showPagination"
    :layout="showSizes ? 'sizes,prev,pager,next' : 'prev,pager,next'"
    :page-sizes="pageSizes"
    :total="total"
    background
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { handlePageSizes } from '@/composables/utils'

  const props = defineProps<{
    total: number
    defaultPageSize?: number
    defaultCurrentPage?: number
    pageSizesStep?: number
  }>()

  const emits = defineEmits<{
    onStepChange: [number]
    onPageChange: [number]
  }>()

  const pageSizes = ref<Array<number>>([])
  const pageSize = ref<number>(50)
  const currentPage = ref<number>(props.defaultCurrentPage || 1)
  const showSizes = ref<boolean>(true)
  const showPagination = ref<boolean>(Object.keys(pageSizes.value).length > 1 || props.total > 1)

  const handleSizeChange = (newSize: number): void => {
    currentPage.value = 1
    emits('onStepChange', newSize)
  }

  const handleCurrentChange = (newCurrent: number): void => {
    emits('onPageChange', newCurrent)
  }

  watch([pageSizes, () => props.total], () => {
    const newValue = Object.keys(pageSizes.value).length > 1 || props.total > 1
    showPagination.value = newValue

    if (newValue === false) {
      currentPage.value = 1
    }

    props.total <= pageSize.value ? (showSizes.value = false) : (showSizes.value = true)
  })

  watch(
    () => props.total,
    () => {
      pageSizes.value = handlePageSizes(props.total, props.pageSizesStep || 50)
      pageSize.value = pageSizes.value[0] || 50
    },
    {
      deep: true,
      immediate: true,
    }
  )
</script>

<style scoped lang="scss" src="./style.scss"></style>
