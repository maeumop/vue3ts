<script setup lang="ts">
import { ref, reactive, watch, onMounted, inject } from 'vue';
import { useUtil } from '@/js/util';
import { v1 as uuid } from 'uuid';

import type { MemberClientItem } from '@/types/api/memberAccountApi';

import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import type {
  PostClientsAccountsParam,
  PostClientsAccountsRes,
  PutClientsAccountsParam,
  PutClientsAccountsRes,
  GetClientsAccountsExistByIdRes,
  GetClientsAccountsExistByNameRes
} from '@/types/api/memberAccountApi';

import { CONST_CODES, CLIENT_ACCOUT_SERVICE, CLIENT_ACCOUNT_STATUS, } from '@/constants/common';
import { useConstCodeCategory } from '@/js/common';
import type { ConstGenderKeys, ConstClientCategoryKeys, ConstClientCategorySubTotalKeys } from '@/types/common';

import type { Rules, RuleFunc } from '@/components/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { OptionItem, KeyIndex } from '@/components/types';
import type { ModalModel } from '@/components/Modal/types';
import type { ToastModel } from '@/components/Toast/types';

const { VUE_APP_DOMAIN } = process.env;

const util = useUtil();

const { AUTH, GENDER } = CONST_CODES;
const CLIENT_CATEGORY = useConstCodeCategory();
const memberAccountApi = useMemberAccountApi();

const Toast = inject('Toast') as ToastModel;

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'on:create', value: MemberClientItem): void;
  (event: 'on:edit', value: MemberClientItem): void;
}>();

const props = defineProps<{
  idx: number;
  selectedClient?: MemberClientItem;
}>();

// 팝업 기본 설정 ====================
const modal = ref<ModalModel>();
let isShow = ref<boolean>(true);
watch(isShow, (v) => {
  // Modal을 완전히 파기 하기 위한 처리
  if (!v) {
    emit('close');
  }
});
// END - 팝업 기본 설정 ====================

let isCreate = ref<boolean>(true);
let clientData = reactive<MemberClientItem>({
  clientAccountMemberRelUid: '',
  clientAccountUid: '',
  inviteDatetime: 0,
  authLevel: AUTH.MASTER.VAL,
  clientName: '',
  clientId: '',
  mainCategory: '',
  subCategory: '',
  targetGender: '',
  targetAge: '',
  keyword: '',
  domains: [{ isMain: 1, domain: '' }],
  ftpUrl: '',
  ftpId: '',
  ftpPassword: '',
  ftpDomain: '',
  accountStatus: CLIENT_ACCOUNT_STATUS.PENDING.VAL,
  serviceType: CLIENT_ACCOUT_SERVICE.AD.VAL,
  regDatetime: 0,
  modDatetime: 0,
});

const optGender: OptionItem[] = [
  { text: GENDER.MALE.TXT, value: GENDER.MALE.VAL },
  { text: GENDER.FEMALE.TXT, value: GENDER.FEMALE.VAL },
  { text: GENDER.ALL.TXT, value: GENDER.ALL.VAL },
];
let selectedAge = ref<string[]>([]);
const optAge: OptionItem[] = [
  { text: '10대', value: '10' },
  { text: '20대', value: '20' },
  { text: '30대', value: '30' },
  { text: '40대', value: '40' },
  { text: '50대', value: '50' },
  { text: '60대 이상', value: '60' },
];


// ============== 카테고리 ========================================
let selectedCateIdx = ref<number>(0);
let selectedCateIdx2 = ref<number>(-1);
/**
 * 1차 카테고리 선택
 * @param index 선택된 카테고리 index
 */
const onSelectedCate = (index: number): void => {
  selectedCateIdx.value = index;
  clientData.mainCategory = CLIENT_CATEGORY.codes[index].VAL;
  clientData.subCategory = '';
  selectedCateIdx2.value = -1;
  isPass.value = true;
};

/**
 * 2차 카테고리 선택
 * @param index 선택된 카테고리 index
 */
const onSelectedCate2 = (index: number, cate: string): void => {
  clientData.subCategory = cate;
  selectedCateIdx2.value = index;
  isPass.value = true;
};

/**
 * 광고주 정보 수정일 때 광고주 카테고리 active 처리
 */
const selectedCateCheck = () => {
  for (let i = 0; i < CLIENT_CATEGORY.codes.length; i++) {
    if (CLIENT_CATEGORY.codes[i].VAL === clientData.mainCategory) {
      selectedCateIdx.value = i;
      break;
    }
  }

  for (let i = 0; i < CLIENT_CATEGORY.codes[selectedCateIdx.value].codes.length; i++) {
    if (CLIENT_CATEGORY.codes[selectedCateIdx.value].codes[i].VAL === clientData.subCategory) {
      selectedCateIdx2.value = i;
      break;
    }
  }
};
// End - 카테고리 ========================================

// ============== Form Validation ===================================
const validateForm = ref<ValidateFormModel>();
const rules: Rules = {
  input: [v => !!v || '필수 입력 사항 입니다.' ],
  cate: [v => (v > -1) || '카테고리를 선택해주세요.' ],
  check: [v => !!(v.length) || '필수 선택 사항 입니다.' ],
  id: [v => util.getRegExp('id').test(v) || '4~20자 이내로 입력해주세요. (영문, 숫자만 입력 가능)' ],
  name: [v => util.getRegExp('hanengnum').test(v) || '한글,영문, 숫자만 입력 가능합니다.'],
  domain: [
    v => !!v || '필수 입력 항목입니다.',
    v => !(v.indexOf('http') > -1) || '프로토콜(http://, https://)을 제외한 도메인을 입력해주세요.',
    v => util.getRegExp('domainWithoutProtocol').test(v) || '유효하지 않은 도메인입니다.'
  ],
};

// ============== 광고주 id, name 중복 체크 ==========================
const validationMsg = reactive<KeyIndex<string>>({
  clientId: '',
  clientName: '',
});

const duplicationChecked = reactive<KeyIndex<string>>({
  id: '',
  name: '',
});

const duplicationCheckId = async (id: string): Promise<void> => {
  if (!isCreate.value) {
    return;
  }

  if (!util.getRegExp('id').test(clientData.clientId)) {
    idValidation();

  } else {
    try {
      const { results }: GetClientsAccountsExistByIdRes = await memberAccountApi.getClientsAccountsExistById(id);
      duplicationChecked.id = clientData.clientId;
      validationMsg.clientId = results.isExist ? '이미 등록된 광고주 아이디입니다.' : '';

    } catch (err) {
      console.log(err);
    }
  }
};

const idValidation = (): RuleFunc[] => {
  if (!util.getRegExp('id').test(clientData.clientId)) {
    validationMsg.clientId = '';
    return rules.id;
  }

  return [];
};

const duplicationCheckName = async (name: string): Promise<void> => {
  if (!isCreate.value) {
    return;
  }

  if (!util.getRegExp('hanengnum').test(clientData.clientName)) {
    idValidation();

  } else {
    try {
      const { results }: GetClientsAccountsExistByNameRes = await memberAccountApi.getClientsAccountsExistByName(name);
      validationMsg.clientName = results.isExist ? '이미 등록된 광고주 이름입니다.' : '';

    } catch (err) {
      console.log(err);
    }
  }
};

const nameValidation = (): RuleFunc[] => {
  if (!util.getRegExp('hanengnum').test(clientData.clientName)) {
    validationMsg.clientName = '';
    return rules.name;
  }

  return [];
};

let isPass = ref<boolean>(true);
const validation = (): void => {
  if (props.idx > -1 && !isPass.value) {
    isPass.value = true;
  }
};
// End -  Form Validation ==================================


// ============== 등록/수정 처리 =================================
/**
 * 광고주 등록
 */
const createClient = async (): Promise<void> => {
  const targetAge: string = selectedAge.value.join(',');
  const keyword: string = clientData.keyword.split(',').map(item => item.trim()).join(',');

  const domain = clientData.domains.filter(item => item.isMain === 1);

  const param: PostClientsAccountsParam = {
    clientAccountUid: uuid(),
    clientAccountMemberRelUid: uuid(),
    clientName: clientData.clientName,
    clientId: clientData.clientId,
    mainCategory: clientData.mainCategory,
    subCategory: clientData.subCategory,
    targetGender: clientData.targetGender as ConstGenderKeys,
    targetAge,
    keyword,
    domain: domain[0].domain,
  };

  validateForm.value?.formProtection();

  await memberAccountApi.postClientsAccounts(param);
  const newClient: MemberClientItem = {
    ...clientData,
    clientAccountMemberRelUid: param.clientAccountMemberRelUid,
    inviteDatetime: Date.now(),
    regDatetime: Date.now(),
    targetAge,
  };
  emit('on:create', newClient);
  Toast('정상적으로 신청되었습니다.');

  modal.value!.close();

  validateForm.value?.formProtection(false);
};

/**
 * 광고주 수정
 */
const editClient = async (): Promise<void> => {
  const targetAge: string = selectedAge.value.join(',');
  const keyword: string = clientData.keyword.split(',').map(item => item.trim()).join(',');

  const domain = clientData.domains.filter(item => item.isMain === 1);

  const param: PutClientsAccountsParam = {
    mainCategory: clientData.mainCategory as ConstClientCategoryKeys,
    subCategory: clientData.subCategory as ConstClientCategorySubTotalKeys,
    targetGender: clientData.targetGender as ConstGenderKeys,
    targetAge,
    keyword,
    domain: domain[0].domain,
  };

  validateForm.value?.formProtection();

  await memberAccountApi.putClientsAccounts(clientData.clientId, param);

  const editData: MemberClientItem = {
    ...props.selectedClient!,
    ...param,
  };
  emit('on:edit', editData);
  Toast('정상적으로 수정되었습니다.');

  modal.value!.close();

  validateForm.value?.formProtection(false);
};


let loading = ref<boolean>(false);
/**
 * [ 등록|수정 ] 버튼 클릭이벤트 핸들러
 */
const onClickEvnt = async (): Promise<void> => {
  if (!validateForm.value!.validate()) {
    return;
  }

  try {
    loading.value = true;
    if (isCreate.value) {
      await createClient();
    } else {
      await editClient();
    }

  } catch (err) {
    util.axiosErrorCatch<PostClientsAccountsRes| PutClientsAccountsRes>(err);

  } finally {
    loading.value = false;
  }
};
// End - 등록/수정 처리 =================================

/**
 * 전달 받은 클라이언트 정보 각 변수에 넣기
 */
const getData = (): void => {
  const client = props.selectedClient!;

  clientData.clientName = client.clientName;
  clientData.clientId = client.clientId;
  clientData.mainCategory = client.mainCategory;
  clientData.subCategory = client.subCategory;
  clientData.targetGender = client.targetGender;
  clientData.keyword = client.keyword || '';
  clientData.ftpUrl = client.ftpUrl || '';
  clientData.ftpId = client.ftpId || '';
  clientData.ftpDomain = client.ftpDomain || '';
  clientData.accountStatus = client.accountStatus || '';
  clientData.serviceType = client.serviceType;
  clientData.regDatetime = client.regDatetime;
  clientData.modDatetime = client.modDatetime;
  clientData.domains = client.domains;

  selectedAge.value = client.targetAge.split(',');

  selectedCateCheck();
};

onMounted(() => {
  if (props.idx > -1 && props.selectedClient) {
    isCreate.value = false;
    isPass.value = false;
    getData();
  }
});
</script>

<template>
  <Modal
    ref="modal"
    width="520px"
    :esc-close="!loading"
    :title="isCreate ? '서비스 신청' : '수정'"
    v-model="isShow"
  >
    <template #body>
      <div id="serviceRegist">
        <ValidateForm ref="validateForm">

          <TextField
            block
            required
            label="광고주 ID"
            placeholder="ex) dreaminsight"
            :readonly="!isCreate"
            :max-length="20"
            :validate="idValidation()"
            :error-message="validationMsg.clientId"
            @blur="duplicationCheckId(clientData.clientId)"
            v-model="clientData.clientId"
          />

          <TextField
            block
            required
            label="광고주이름"
            placeholder="ex) 드림인사이트"
            class="mt-20"
            :readonly="!isCreate"
            :max-length="20"
            :validate="nameValidation()"
            :error-message="validationMsg.clientName"
            @blur="duplicationCheckName(clientData.clientName)"
            v-model="clientData.clientName"
          />

          <div class="mt-20">
            <div class="textField-label required">
              <label>카테고리</label>
            </div>

            <ValidateWrap
              :validate="rules.cate"
              :check-value="selectedCateIdx2"
            >
              <div class="categorySelectBox">
                <div class="cateList">
                  <div class="cateBox">
                    <template
                      :key="`cate-${cate.VAL}`"
                      v-for="(cate, key) in CLIENT_CATEGORY.codes"
                    >
                      <div
                        :class="{ 'active': cate.VAL === clientData.mainCategory }"
                        @click.prevent="onSelectedCate(key)"
                      >
                        {{ cate.TXT }}
                      </div>
                    </template>
                  </div>

                  <div class="cateBox" v-if="clientData.mainCategory">
                    <template
                      :key="`cate-${cate2.VAL}`"
                      v-for="(cate2, key) in CLIENT_CATEGORY.codes[selectedCateIdx].codes"
                    >
                      <div
                        :class="{ 'active': key === selectedCateIdx2 }"
                        @click.prevent="onSelectedCate2(key, cate2.VAL)"
                      >
                        {{ cate2.TXT }}
                      </div>
                    </template>
                  </div>
                </div>
                <div :class="['selectedBox', { selected: !!clientData.subCategory }]">
                  {{ clientData.subCategory ? CLIENT_CATEGORY.codes[selectedCateIdx].TXT : '카테고리를 선택해주세요' }}
                  <template v-if="!!clientData.mainCategory && !!clientData.subCategory && selectedCateIdx2 > -1">
                    > {{ CLIENT_CATEGORY.codes[selectedCateIdx].codes[selectedCateIdx2].TXT }}
                  </template>
                </div>
              </div>
            </ValidateWrap>
          </div>

          <CheckButton
            required
            type="radio"
            color="primary"
            class="mt-20"
            label="성별(타겟)"
            name="gender"
            :items="optGender"
            :validate="rules.check"
            @change="validation()"
            v-model="clientData.targetGender"
          />

          <CheckButton
            required
            color="primary"
            name="age"
            class="mt-20"
            label="나이(타겟)"
            :items="optAge"
            :validate="rules.check"
            @change="validation()"
            v-model="selectedAge"
          />
          <TextField
            block
            required
            multiline
            is-counting
            label="연관 키워드"
            class="mt-20"
            placeholder="ex)건강, 화장품"
            :rows="5"
            :max-length="200"
            :validate="rules.input"
            @blur="validation()"
            v-model="clientData.keyword"
          />

          <ul class="info-box-bullet mb-20">
            <li>
              관련 키워드를 입력해주세요.(여러 키워드 입력 시 콤마(,)로 구분하여
              입력해주세요.)
            </li>
          </ul>

          <template v-if="isCreate">
            <div class="textField-label required mt-20">
              <label>도메인 연결</label>
            </div>

            <div class="gap-4 mb-4">
              <TextField
                block
                required
                :placeholder="`ex) ${VUE_APP_DOMAIN}`"
                :validate="rules.domain"
                v-model="clientData.domains[0].domain"
              />
            </div>

            <ul class="info-box-bullet mb-20">
              <li>도메인 연결은 광고 페이지에 연결될 고유의 주소(URL)를 말합니다.</li>
              <li>도메인 사용 가능 여부는 ’<a href="https://hosting.cafe24.com/?controller=new_domain_search" target="_blank">카페24 호스팅 센터(🔗 바로가기)</a>’를 통해 확인 가능합니다.</li>
              <li>co.kr (22,000원/1년) / .kr(22,000원/1년) / .com (23,500원/1년) 비용 발생</li>
              <li>한글 도메인은 연결이 불가능합니다.</li>
            </ul>
          </template>

          <template v-if="!isCreate && clientData.domains.length > 0">
            <div class="textField-label mt-20">
              <label>연결된 도메인 리스트</label>
            </div>
            <TextField
              block
              disabled
              :key="`domain-${item}`"
              :class="{ 'mt-5' : index !== 0 }"
              :placeholder="item.domain"
              v-for="(item, index) in clientData.domains"
            />
          </template>
        </ValidateForm>
      </div>
    </template>

    <template #action="{ close }">
      <StyledButton
        outline
        class="mr-10"
        :disabled="loading"
        @click.prevent="close"
      >
        취소
      </StyledButton>
      <StyledButton
        color="primary"
        :loading="loading"
        :disabled="!isPass"
        @click.prevent="onClickEvnt"
      >
        {{ isCreate ? '신청' : '수정' }}
      </StyledButton>
    </template>
  </Modal>
</template>
