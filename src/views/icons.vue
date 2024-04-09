<script setup lang="ts">
import {
  mdiGoogleCirclesExtended,
  mdiCalendarMonth,
  mdiCheckboxMarked,
  mdiCheckboxBlankOutline,
  mdiWindowClose,
  mdiHelpCircle,
  mdiCog,
  mdiChevronDown,
  mdiMagnify,
  mdiCheckboxBlankCircle,
  mdiClose,
  mdiInformationBoxOutline,
  mdiPlus,
  mdiTriangleSmallUp,
  mdiPencil,
  mdiInformation,
  mdiMinus,
  mdiCodeNotEqualVariant,
  mdiFolder,
  mdiRadioboxMarked,
  mdiCircle,
  mdiRadioboxBlank,
  mdiCheckboxBlank,
  mdiChevronDoubleLeft,
  mdiChevronLeft,
  mdiChevronDoubleRight,
  mdiChevronRight,
  mdiUnfoldMoreHorizontal,
  mdiCheckCircleOutline,
  mdiChatAlert,
  mdiInformationVariantCircleOutline,
  mdiCloseOctagon,
  mdiDatabase,
  mdiLayers,
  mdiBellAlertOutline,
  mdiPencilBoxMultiple,
  mdiDownload,
  mdiUpload,
  mdiReply,
  mdiPower,
  mdiRestart,
  mdiOpenInNew,
  mdiExportVariant,
  mdiContentSave,
  mdiChevronUp,
  mdiInformationVariantCircle,
  mdiArrowCollapseUp,
  mdiAlert,
  mdiMessageBadgeOutline,
  mdiTrashCan,
  mdiFileCodeOutline,
  mdiArrowExpandLeft,
  mdiArrowExpandRight,
  mdiArrowExpand,
  mdiFullscreen,
  mdiCircleSlice3,
  mdiMedication,
  mdiAccountAlert,
  mdiSpider,
  mdiHorizontalRotateClockwise,
  mdiCoffin,
  mdiPencilOutline,
  mdiTune,
  mdiRefresh,
  mdiFileDocumentEdit,
  mdiFileExcel,
  mdiTrashCanOutline,
  mdiCircleMedium,
  mdiHelpCircleOutline,
  mdiAlertCircle,
  mdiContentCopy,
} from '@/assets/svg/path';
</script>

<template>
  <div class="content p-15">
    <div class="card">
      <div class="card-header">
        Icons
      </div>
      <div class="card-body icons">
        <p>
          <SvgIcon type="mdi" :path="mdiGoogleCirclesExtended" />
          mdiGoogleCirclesExtended
        </p>
        <div class="path-string">{{ mdiGoogleCirclesExtended }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCalendarMonth" />
          mdiCalendarMonth
        </p>
        <div class="path-string">{{ mdiCalendarMonth }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCheckboxMarked" />
          mdiCheckboxMarked
        </p>
        <div class="path-string">{{ mdiCheckboxMarked }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCheckboxBlankOutline" />
          mdiCheckboxBlankOutline
        </p>
        <div class="path-string">{{ mdiCheckboxBlankOutline }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiWindowClose" />
          mdiWindowClose
        </p>
        <div class="path-string">{{ mdiWindowClose }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiHelpCircle" />
          mdiHelpCircle
        </p>
        <div class="path-string">{{ mdiHelpCircle }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCog" />
          mdiCog
        </p>
        <div class="path-string">{{ mdiCog }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiChevronDown" />
          mdiChevronDown
        </p>
        <div class="path-string">{{ mdiChevronDown }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiMagnify" />
          mdiMagnify
        </p>
        <div class="path-string">{{ mdiMagnify }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCheckboxBlankCircle" />
          mdiCheckboxBlankCircle
        </p>
        <div class="path-string">{{ mdiCheckboxBlankCircle }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiClose" />
          mdiClose
        </p>
        <div class="path-string">{{ mdiClose }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiInformationBoxOutline" />
          mdiInformationBoxOutline
        </p>
        <div class="path-string">{{ mdiInformationBoxOutline }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiPlus" />
          mdiPlus
        </p>
        <div class="path-string">{{ mdiPlus }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiTriangleSmallUp" />
          mdiTriangleSmallUp
        </p>
        <div class="path-string">{{ mdiTriangleSmallUp }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiPencil" />
          mdiPencil
        </p>
        <div class="path-string">{{ mdiPencil }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiInformation" />
          mdiInformation
        </p>
        <div class="path-string">{{ mdiInformation }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiMinus" />
          mdiMinus
        </p>
        <div class="path-string">{{ mdiMinus }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCodeNotEqualVariant" />
          mdiCodeNotEqualVariant
        </p>
        <div class="path-string">{{ mdiCodeNotEqualVariant }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiFolder" />
          mdiFolder
        </p>
        <div class="path-string">{{ mdiFolder }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiRadioboxMarked" />
          mdiRadioboxMarked
        </p>
        <div class="path-string">{{ mdiRadioboxMarked }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCircle" />
          mdiCircle
        </p>
        <div class="path-string">{{ mdiCircle }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiRadioboxBlank" />
          mdiRadioboxBlank
        </p>
        <div class="path-string">{{ mdiRadioboxBlank }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCheckboxBlank" />
          mdiCheckboxBlank
        </p>
        <div class="path-string">{{ mdiCheckboxBlank }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiChevronDoubleLeft" />
          mdiChevronDoubleLeft
        </p>
        <div class="path-string">{{ mdiChevronDoubleLeft }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiChevronLeft" />
          mdiChevronLeft
        </p>
        <div class="path-string">{{ mdiChevronLeft }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiChevronDoubleRight" />
          mdiChevronDoubleRight
        </p>
        <div class="path-string">{{ mdiChevronDoubleRight }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiChevronRight" />
          mdiChevronRight
        </p>
        <div class="path-string">{{ mdiChevronRight }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiUnfoldMoreHorizontal" />
          mdiUnfoldMoreHorizontal
        </p>
        <div class="path-string">{{ mdiUnfoldMoreHorizontal }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCheckCircleOutline" />
          mdiCheckCircleOutline
        </p>
        <div class="path-string">{{ mdiCheckCircleOutline }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiChatAlert" />
          mdiChatAlert
        </p>
        <div class="path-string">{{ mdiChatAlert }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiInformationVariantCircleOutline" />
          mdiInformationVariantCircleOutline
        </p>
        <div class="path-string">{{ mdiInformationVariantCircleOutline }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCloseOctagon" />
          mdiCloseOctagon
        </p>
        <div class="path-string">{{ mdiCloseOctagon }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiDatabase" />
          mdiDatabase
        </p>
        <div class="path-string">{{ mdiDatabase }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiLayers" />
          mdiLayers
        </p>
        <div class="path-string">{{ mdiLayers }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiBellAlertOutline" />
          mdiBellAlertOutline
        </p>
        <div class="path-string">{{ mdiBellAlertOutline }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiPencilBoxMultiple" />
          mdiPencilBoxMultiple
        </p>
        <div class="path-string">{{ mdiPencilBoxMultiple }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiDownload" />
          mdiDownload
        </p>
        <div class="path-string">{{ mdiDownload }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiUpload" />
          mdiUpload
        </p>
        <div class="path-string">{{ mdiUpload }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiReply" />
          mdiReply
        </p>
        <div class="path-string">{{ mdiReply }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiPower" />
          mdiPower
        </p>
        <div class="path-string">{{ mdiPower }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiRestart" />
          mdiRestart
        </p>
        <div class="path-string">{{ mdiRestart }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiOpenInNew" />
          mdiOpenInNew
        </p>
        <div class="path-string">{{ mdiOpenInNew }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiExportVariant" />
          mdiExportVariant
        </p>
        <div class="path-string">{{ mdiExportVariant }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiContentSave" />
          mdiContentSave
        </p>
        <div class="path-string">{{ mdiContentSave }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiChevronUp" />
          mdiChevronUp
        </p>
        <div class="path-string">{{ mdiChevronUp }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiInformationVariantCircle" />
          mdiInformationVariantCircle
        </p>
        <div class="path-string">{{ mdiInformationVariantCircle }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiArrowCollapseUp" />
          mdiArrowCollapseUp
        </p>
        <div class="path-string">{{ mdiArrowCollapseUp }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiAlert" />
          mdiAlert
        </p>
        <div class="path-string">{{ mdiAlert }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiMessageBadgeOutline" />
          mdiMessageBadgeOutline
        </p>
        <div class="path-string">{{ mdiMessageBadgeOutline }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiTrashCan" />
          mdiTrashCan
        </p>
        <div class="path-string">{{ mdiTrashCan }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiFileCodeOutline" />
          mdiFileCodeOutline
        </p>
        <div class="path-string">{{ mdiFileCodeOutline }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiArrowExpandLeft" />
          mdiArrowExpandLeft
        </p>
        <div class="path-string">{{ mdiArrowExpandLeft }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiArrowExpandRight" />
          mdiArrowExpandRight
        </p>
        <div class="path-string">{{ mdiArrowExpandRight }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiArrowExpand" />
          mdiArrowExpand
        </p>
        <div class="path-string">{{ mdiArrowExpand }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiFullscreen" />
          mdiFullscreen
        </p>
        <div class="path-string">{{ mdiFullscreen }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCircleSlice3" />
          mdiCircleSlice3
        </p>
        <div class="path-string">{{ mdiCircleSlice3 }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiMedication" />
          mdiMedication
        </p>
        <div class="path-string">{{ mdiMedication }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiAccountAlert" />
          mdiAccountAlert
        </p>
        <div class="path-string">{{ mdiAccountAlert }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiSpider" />
          mdiSpider
        </p>
        <div class="path-string">{{ mdiSpider }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiHorizontalRotateClockwise" />
          mdiHorizontalRotateClockwise
        </p>
        <div class="path-string">{{ mdiHorizontalRotateClockwise }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCoffin" />
          mdiCoffin
        </p>
        <div class="path-string">{{ mdiCoffin }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiPencilOutline" />
          mdiPencilOutline
        </p>
        <div class="path-string">{{ mdiPencilOutline }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiTune" />
          mdiTune
        </p>
        <div class="path-string">{{ mdiTune }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiRefresh" />
          mdiRefresh
        </p>
        <div class="path-string">{{ mdiRefresh }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiFileDocumentEdit" />
          mdiFileDocumentEdit
        </p>
        <div class="path-string">{{ mdiFileDocumentEdit }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiFileExcel" />
          mdiFileExcel
        </p>
        <div class="path-string">{{ mdiFileExcel }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiTrashCanOutline" />
          mdiTrashCanOutline
        </p>
        <div class="path-string">{{ mdiTrashCanOutline }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiCircleMedium" />
          mdiCircleMedium
        </p>
        <div class="path-string">{{ mdiCircleMedium }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiHelpCircleOutline" />
          mdiHelpCircleOutline
        </p>
        <div class="path-string">{{ mdiHelpCircleOutline }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiAlertCircle" />
          mdiAlertCircle
        </p>
        <div class="path-string">{{ mdiAlertCircle }}</div>
        <p>
          <SvgIcon type="mdi" :path="mdiContentCopy" />
          mdiContentCopy
        </p>
        <div class="path-string">{{ mdiContentCopy }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.icons {
  p {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    svg {
      margin-right: 5px;
    }
  }

  .path-string {
    border: 1px solid $gray-300;
    padding: 15px;
    margin-bottom: 15px;
  }
}
</style>