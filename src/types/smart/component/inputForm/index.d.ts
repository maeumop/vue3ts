import type { FIX_FIELD_NAME } from '@/constants/smart/component';
import type { InputFieldConfigItem } from '@/types/api/databaseApi';
import type { BooleanYN, ConstDbInputFieldTypeKeys } from '@/types/common';

// 고정 입력 항목 명칭 구분 =====================================================================
/**
 * 고정 입력 항목 명칭 구분
 * 스마트편집 > 입력폼 > *
 */
export type FIX_FIELD_NAME_TYPE = typeof FIX_FIELD_NAME[keyof typeof FIX_FIELD_NAME];

export interface InputConfigEditFormValuesItem {
  label: string
  // privacyYn, thirdPartyYn, smsYn 는 입력방식이 radio, select, checkbox 여도 value값 존재 X
  value?: string
  // checked 적용
  checked?: boolean
}

/***********************************************************************************************************************************************/
/* interface                                                                                                                                   */
export interface InputConfigEditForm {
  dbInputFieldConfigUid?: string
  // name
  fieldName: string
  // 변환코드
  replaceCode: string
  // 항목명
  fieldLabel: string
  // 입력형식 (type)
  fieldType: ConstDbInputFieldTypeKeys

  hiddenValue?: string
  options?: InputConfigListItemOptionsItem[]

  // placeholder
  placeholder?: string
  //maxlength
  maxLength?: string
  // 입력 범위
  numberInputRange?: string

  // 필수 입력 여부
  isRequire: boolean
  // 단어 필터링 적용
  isTextFiltering: boolean
  // 사용여부
  isUse: boolean
}

export type InputConfigListItem = Omit<InputFieldConfigItem, 'isRequireBatchDb'|'replaceCodeDesc'|'batchDbDesc'>;

// vue v-for key property 대신 주입햐여 할 경우 사용한다.
// v-for key 값으로 index 이용시, 요소 자체로 구분 값이 될수 없기에, 따로 지정을 합니다.
// https://medium.com/sjk5766/react-%EB%B0%B0%EC%97%B4%EC%9D%98-index%EB%A5%BC-key%EB%A1%9C-%EC%93%B0%EB%A9%B4-%EC%95%88%EB%90%98%EB%8A%94-%EC%9D%B4%EC%9C%A0-3ce48b3a18fb
// 위의 링크 참고
export type InputConfigListItemOptionsItem = { key: string } & InputConfigEditFormValuesItem;

// @/views/smart/component/InputForm/layer/InputItemEditor/Options.vue fieldType props
export type OptionsFieldType = Extract<ConstDbInputFieldTypeKeys, 'RADIO' | 'SELECT' | 'CHECK'>;
/***********************************************************************************************************************************************/


/***********************************************************************************************************************************************/
/* interface                                                                                                                                   */

export interface InputFormEditForm {
  compInputFormUid?: string
  // 입력폼 명
  inputFormName: string
  // 레이아웃 uid
  layoutUid: string

  /* 아래 프로퍼티는 모달에서 받을 속성 값입니다. */
  sourceCode: string
}

export interface CreateInputFormItemCode {
  // 항목명
  fieldLabel: string
  // 변환코드
  replaceCode: string

  // 사용여부
  isUse: BooleanYN
}
/***********************************************************************************************************************************************/
