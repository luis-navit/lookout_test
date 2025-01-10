<template>
  <div class="rule-card__wrapper">
    <div class="rule-card__header">
      <span class="text--lg bold">{{ title }}</span>
      <el-switch class="custom-switch" v-model="ruleState" @change="handleChangeState"></el-switch>
    </div>
    <div class="rule-card__body">
      <span class="text--md"> <strong class="bold">Classe: </strong>{{ ruleClass }} </span>
      <span class="text--md">
        <strong class="bold">Acurácia: </strong>
        {{ accuracy }}
      </span>
      <span class="text--md">
        <strong class="bold">Contagem de precisão: </strong>
        {{ accuracyCount }}
      </span>
      <span class="text--md">
        <strong class="bold">Erro: </strong>
        {{ error }}%
      </span>
      <span class="text--md">
        <strong class="bold">Contagem de erros: </strong>
        {{ errorCount }}
      </span>
      <el-tolltip :content="query" placement="bottom" :show-after="300" :hide-after="300">
        <span class="text--md ellipsis">
          <strong class="bold">Regra: </strong>
          {{ query }}
        </span>
      </el-tolltip>
    </div>
    <div class="rule-card__footer">
      <el-button type="primary" @click="handleConfig">Configurar regra</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const props = defineProps<{
    title: string
    query: string
    ruleClass: string
    status: boolean
    accuracy: number
    accuracyCount: number
    error: number
    errorCount: number
  }>()

  const emits = defineEmits<{
    onConfig: []
    onChangeState: [newState: boolean]
  }>()

  const ruleState = ref<boolean>(props.status)

  const handleConfig = (): void => {
    emits('onConfig')
  }

  const handleChangeState = (newState: boolean): void => {
    emits('onChangeState', newState)
  }
</script>

<style scoped lang="scss" src="./style.scss"></style>
