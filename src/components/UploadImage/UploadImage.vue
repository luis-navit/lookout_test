<template>
  <div>
    <div class="image-container__wrapper">
      <el-image class="image-upolad__preview smooth" :src="getPreviewImage" fit="contain" />
      <div class="upload-actions">
        <el-upload
          class="upload-container"
          :autoUpload="false"
          :showFileList="false"
          :on-change="beforeImageUpload"
          v-model:file-list="imageList"
          accept=".jpg,.png,jpeg"
        >
          <template #trigger>
            <el-button class="upload-container__trigger">
              <template v-if="showUploadIcon" #icon>
                <el-icon :icon="uploadIcon">
                  <component :is="uploadIcon" />
                </el-icon>
              </template>
              <span>{{ getButtonLabel }}</span>
            </el-button>
          </template>
        </el-upload>
        <el-button
          class="upload-container__trigger"
          v-if="isUploadedImage"
          type="danger"
          @click="handleClearLoadImage"
        >
          Excluir foto
        </el-button>
      </div>
    </div>
    <AppModal
      :show="isCroppVisible"
      title="Edite sua imagem"
      subtitle="Personalize a aparência da sua imagem com a ferramenta de corte."
      primaryBtnLabel="Salvar edição"
      @OnSubmit="handleCrop"
      @Close="handleClose"
      @OnClose="handleClose"
    >
      <div class="cropper-wrapper">
        <cropper
          class="cropper"
          ref="cropperRef"
          :src="croppImage.src"
          background-class="twitter-cropper__background"
          foreground-class="twitter-cropper__foreground"
          image-restriction="stencil"
          :stencil-props="{
            aspectRatio: 10 / 10,
            backgroundClassname: 'cropper__background',
            previewClass: 'preview',
            imageClassname: 'background-image',
            handlersClasses: {
              default: 'handler',
              hover: 'handler--hover',
              eastNorth: 'handler--east-north',
              westNorth: 'handler--west-north',
              westSouth: 'handler--west-south',
              eastSouth: 'handler--east-south',
            },
            handlers: {
              eastNorth: true,
              north: false,
              westNorth: true,
              west: false,
              westSouth: true,
              south: false,
              eastSouth: true,
              east: false,
            },
          }"
        />
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
  import 'vue-advanced-cropper/dist/style.css'
  import { computed, onUnmounted, ref, watch } from 'vue'
  import { handleBlobToFile } from '@/composables/utils'
  import { Cropper } from 'vue-advanced-cropper'
  import { elMessage } from '@/composables/element'
  import { elementTypesEnum } from '@/enums/elementTypesEnum'
  import { ElMessageBox } from 'element-plus'
  import AppModal from '@/components/AppModal/AppModal.vue'
  import emptyImage from '@/assets/emptyUserAvatar.png'

  const props = withDefaults(
    defineProps<{
      defaultImage: string
      uploadBtnLabel?: string
      uploadIcon?: string
      formatsAllowed?: Array<any>
      showUploadIcon?: boolean
      maxSize?: number
    }>(),
    {
      maxSize: 1,
      showUploadIcon: true,
      uploadIcon: 'UploadFilled',
      uploadBtnLabel: 'Upload image',
      formatsAllowed: () => ['image/jpeg', 'image/png', 'image/jpg'],
    }
  )

  const cropperRef = ref()
  const croppImage = ref<{ src: string; type: string }>({
    src: '',
    type: 'image/jpg',
  })

  const imageList = ref<Array<any>>([])
  const isCroppVisible = ref<boolean>(false)
  const previewImage = ref<string>('')

  const emits = defineEmits<{
    'on-crop': [File | 'undefined']
  }>()

  const handleClose = () => {
    imageList.value.pop()
    isCroppVisible.value = false
  }

  const handleClearLoadImage = (): void => {
    ElMessageBox.confirm(
      'Ao excluir a foto, você removerá a imagem do seu usuário! Deseja continuar com a ação de excluir?',
      'Deseja excluir a foto?',
      {
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        confirmButtonClass: 'danger-btn',
      }
    ).then(() => {
      if (previewImage.value.includes('data:/image/png;base64')) {
        previewImage.value = emptyImage
        emits('on-crop', 'undefined')
      } else {
        previewImage.value = props.defaultImage
      }
    })
  }

  const handleCrop = () => {
    const result: any = cropperRef.value

    previewImage.value = result.getResult().canvas.toDataURL('image/jpg')
    isCroppVisible.value = false
    result.getResult().canvas.toBlob((blob: any) => {
      const image = handleBlobToFile(blob, 'profile-image.jpg')
      emits('on-crop', image)
    }, 'image/jpg')
  }

  const beforeImageUpload = ({ raw: fileRaw }: any): void => {
    const isAllowed = props.formatsAllowed.includes(fileRaw.type)
    if (!isAllowed) {
      elMessage('Formato da imagem precisa ser jpeg ou png!', elementTypesEnum.ERROR)
      imageList.value.pop()
      return
    }

    if (fileRaw.size / 1024 / 1024 > props.maxSize) {
      elMessage(`Tamanho da imagem não pode exceder ${props.maxSize}MB!`, elementTypesEnum.ERROR)
      imageList.value.pop()
      return
    }

    imageList.value = [fileRaw]
    handleCroppImage(fileRaw)
    isCroppVisible.value = true
  }

  const handleCroppImage = (imageFile: any) => {
    if (croppImage.value.src) {
      URL.revokeObjectURL(croppImage.value.src)
    }
    const blob = URL.createObjectURL(imageFile)

    croppImage.value = {
      src: blob,
      type: imageFile?.type,
    }
  }

  const getPreviewImage = computed(() => {
    return previewImage.value
  })

  const getButtonLabel = computed((): string => {
    return previewImage.value.includes('data:image/png;base64') ? 'Alterar foto' : 'Adicionar foto'
  })

  const isUploadedImage = computed((): boolean => {
    return (
      previewImage.value.includes('data:image/png;base64') ||
      previewImage.value.includes('data:/image/png;base64')
    )
  })

  watch(
    () => props.defaultImage,
    (value) => {
      previewImage.value = value
    },
    {
      immediate: true,
    }
  )

  onUnmounted(() => {
    if (croppImage.value.src) {
      URL.revokeObjectURL(croppImage.value.src)
    }
  })
</script>

<style src="./style.scss" lang="scss"></style>
