<script setup lang="ts">
import { ref, reactive, inject } from 'vue';
import type { Rules, OptionItem } from '@/components/types';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ToastColorCase, ToastModel } from '@/components/Toast/types';
import type { SpinnerModel } from '@/components/Spinner/types';
import type { ValidateFormModel } from '@/components/Form/ValidateForm/types';
import type { DropMenuItem  } from '@/components/DropMenu/types';
import { dropMenuTransition, dropMenuPosition } from '@/components/DropMenu/const';
import type { ListTableModel, ListTableHeader, ListTableItem, ListTableItemSlot } from '@/components/ListTable/types';
import ListTableCheckbox from '@/components/ListTable/listCheck.vue';
import StatusSelector from '@/components/StatusSelector/index.vue';

import axios from 'axios';

import {
  mdiBellAlertOutline, mdiPencilBoxMultiple, mdiMagnify,
  mdiPencil, mdiDownload, mdiUpload, mdiReply, mdiPower,
  mdiOpenInNew,
  mdiChevronDown, mdiChevronUp, mdiInformationVariantCircle,
  mdiArrowCollapseUp, mdiAlert, mdiMessageBadgeOutline,
  mdiTrashCan, mdiFileCodeOutline, mdiArrowExpandLeft,
  mdiArrowExpandRight, mdiArrowExpand, mdiFullscreen,
  mdiCircleSlice3, mdiMedication, mdiAccountAlert,
  mdiSpider, mdiHorizontalRotateClockwise, mdiCoffin,
} from '@/assets/svg/path';

const MessageBox = inject('MessageBox') as MessageBoxModel;
const Toast = inject('Toast') as ToastModel;
const Spinner = inject('Spinner') as SpinnerModel;

let text = ref<string>('');
let textarea = ref<string>('');
let num = ref<number>(0);
let select = ref<string>('');
let selectMulti = ref<any[]>([]);
let date1 = ref<string>('');
let date2 = ref<string>('');
let rangeDate = ref<string[]>(['2023-06-01', '2023-06-07']);
let checked = ref<string[]>([]);
let radio = ref<string>('');
let checked2 = ref<string[]>(['1', '3', '5']);
let radio2 = ref<string>('3');
let radio3 = ref<string>('');
let btnChecked = ref<string[]>([]);
let btnChecked2 = ref<string[]>(['1', '3', '4']);
let switchYN = ref<string>('N');
let switchBool = ref<boolean>(false);

const buttonColors: string[] = ['primary', 'success', 'info', 'warning', 'danger', 'dark', 'secondary'];

const opt: OptionItem[] = [
  { text: '딸기', value: '1' },
  { text: '바나나', value: '2' },
  { text: '옥수수', value: '3' },
  { text: '커피콩', value: '4' },
  { text: '두리안', value: '5' },
  { text: '체리', value: '6' },
  { text: '고구마', value: '7' },
  { text: '감자', value: '8' },
  { text: '블루베리', value: '9' },
  { text: '아몬드', value: '10' },
  { text: '샤인머스켓', value: '11' },
  { text: '수박', value: '12' },
  { text: '참외', value: '13' },
  { text: '멜론', value: '14' },
  { text: '땅콩', value: '15' },
];
const items: OptionItem[] = [
  { text: '원신', value: '1' },
  { text: '바이오하자드', value: '2' },
  { text: '갓 오브 워', value: '3' },
  { text: '스파이더맨', value: '4' },
  { text: '호라이즌: 포비든 웨스트', value: '5' },
  { text: '래드 데드 리댐션', value: '6' },
];
const rule: Rules = {
  input: [v => !!v || '입력해야지!!!'],
  number: [v => !(Number(v) === 0) || '0이외의 값을 입력!!!'],
  select: [v => !!v || '선택하라고!'],
  selectMulti: [v => !(v.length < 2) || '2개 이상 선택!'],
  check: [v => !(v.length === 0) || '체크해라!']
};

const dropMenuItem: DropMenuItem[] = [
  {
    text: '원신',
    icon: mdiCircleSlice3,
    action: () => {
      console.log('메뉴 1 click');
    }
  },
  {
    text: '바이오하자드',
    icon: mdiMedication,
    action: () => {
      console.log('메뉴 2 click');
    }
  },
  {
    text: '갓 오브 워',
    icon: mdiAccountAlert,
    action: () => {
      console.log('메뉴 3 click');
    }
  },
  {
    text: '스파이더맨',
    icon: mdiSpider,
    action: () => {
      console.log('메뉴 4 click');
    }
  },
  {
    text: '호라이즌: 포비든 웨스트',
    icon: mdiHorizontalRotateClockwise,
    action: () => {
      console.log('메뉴 5 click');
    }
  },
  {
    text: '레대 데드 리댐션',
    icon: mdiCoffin,
    action: () => {
      console.log('메뉴 6 click');
    }
  },
];

const MessageBoxAlert = (flag?: string): void => {
  if (flag === 'confirm') {
    MessageBox.confirm({
      escCancel: false,
      title: '재밌는데?',
      message: '드디어 간다!',
      okay: () => {
        Toast('oh Yes!!!');
      }
    });
  } else {
    MessageBox.alert({
      message: '갈까나~!?',
      okay: () => {
        Toast('alert boom!!!');
      }
    });
  }
};

const withButtonClick = (): void => {
  MessageBox.alert('버튼과 함께 있는 TextField');
};

const showToast = (color?: ToastColorCase): void => {
  if (color === 'success') {
    Toast('이런 메시지가 보인다!');
  } else {
    Toast({
      color,
      message: '보인다고~~~'
    });
  }
};

const showSpinner = (delay: number = 0, timeout = 3): void => {
  Spinner.timeout(timeout).delay(delay).show();
};

const form1 = ref<ValidateFormModel>();
const form2 = ref<ValidateFormModel>();
const form3 = ref<ValidateFormModel>();
const form4 = ref<ValidateFormModel>();
const form5 = ref<ValidateFormModel>();
const form6 = ref<ValidateFormModel>();

const checkForm = (index: number = 0): void => {
  switch (index) {
    case 1: form2.value?.validate(); break;
    case 2: form3.value?.validate(); break;
    case 3: form4.value?.validate(); break;
    case 4: form5.value?.validate(); break;
    case 5: form6.value?.validate(); break;
    default: form1.value?.validate();
  }
};

let isLoading = ref<boolean>(false);

const showLoading = (): void => {
  if (!isLoading.value) {
    Toast('showLoading');
    isLoading.value = true;

    setTimeout(() => {
      isLoading.value = false;
    }, 5000);
  }
};

let isShow = reactive<{
  [index: string]: boolean
}>({
  popup: false,
  right: false,
  left: false,
  bottom: false,
  cover: false,
  in: false,
});

const showModal = (flag: string): void => {
  isShow[flag] = true;
};

// ListTable
const listTable = ref<ListTableModel>();

const tableHeader: ListTableHeader[] = [
  { text: 'idx', width: '100', sort: true, target: 'db_idx' },
  { text: '이름', width: '150', sort: true, target: 'mb_name' },
  { text: '미디어', width: '300', sort: true, target: 'mda_name' },
  { text: '접속정보', width: '700', sort: true, target: 'referer' },
  { text: 'IP', width: '300', sort: true, target: 'ip' },
  { text: '등록일', width: '300', sort: true, target: 'reg_date' },
  { text: '처리', width: '300' },
];

const list = ref<ListTableItem[]>([]);
const checkList = ref<(string | number)[]>([]);
const checkAll = (checked: boolean): void => {
  if (checked) {
    checkList.value = list.value.map((item: ListTableItem) => item.db_idx);
  } else {
    checkList.value = [];
  }
};

const listTableCheck = (_checked: boolean, value: string | number): void => {
  const index: number = checkList.value.indexOf(value);

  if (_checked && index === -1) {
    checkList.value.push(value);
  } else if (!_checked && index > -1) {
    checkList.value.splice(index, 1);
  }
};

const listTableEvent = (flag: number): void => {
  if (flag === 0) {
    listTable.value!.observerStart();
  } else if (flag === 1) {
    listTable.value!.observerStop();
  } else if (flag === 2) {
    listTable.value!.checkedToggle(true);
  } else if (flag === 3) {
    listTable.value!.checkedToggle();
  }
};

let page: number = 1;
const page_size: number = 50;
let dataLoading = ref<boolean>(false);

const getFormData = (): FormData => {
  const formData = new FormData();

  formData.append('page', page.toString());
  formData.append('page_size', page_size.toString());

  return formData;
};

const getData = async (): Promise<void> => {
  dataLoading.value = true;
  const reuslt = await axios.post('https://dev.admakernews.com/counsel/get_counsel_list', getFormData());

  if (reuslt.data.data.length) {
    page++;
    console.log('loading');

    reuslt.data.data.forEach((item: ListTableItem) => {
      list.value.push(item);
    });

    dataLoading.value = false;
  }
};

const modal = reactive({
  text1: '',
  text2: '',
  text3: '',
  radio: '0',
});

let observerLoading = ref<boolean>(false);

const selectBoxObserved = (): void => {
  observerLoading.value = true;

  setTimeout(() => {
    observerLoading.value = false;
  }, 3000);
};

getData();

const inDate = (reset: boolean = true): void => {
  rangeDate.value = reset ? ['', ''] : ['2023-06-01', '2023-06-07'];
};

import type { StatusSelectorItem } from '@/components/StatusSelector/types';

let status1 = ref<string>('ing');
let status2 = ref<string>('');
let status3 = ref<string>('complete');

const statusItem: StatusSelectorItem[] = [
  {
    text: '대기중',
    value: 'stay',
    color: 'grey',
  },
  {
    text: '연결중',
    value: 'ing',
    color: 'red',
  },
  {
    text: '연결완료',
    value: 'complete',
    color: 'blue',
  },
];

</script>

<template>
  <div class="content p-30">
    <div class="card mt-15">
      <div class="card-header h3">
        Status Selector
      </div>
      <div class="card-body">
        <StatusSelector
          class="mr-10"
          :options="statusItem"
          v-model="status1"
        />
        <StatusSelector
          circle
          read-only
          bg-color="#ffecad"
          class="mr-10"
          :options="statusItem"
          v-model="status2"
        />
        <StatusSelector
          circle
          bg-color=""
          :options="statusItem"
          v-model="status3"
        />
      </div>
    </div>

    <div class="card mt-15">
      <div class="card-header h3">
        Spacing
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col">
            <TextField
              block
              required
              label="유효성 검사 및 필수 입력"
              placeholder="이곳에 텍스트를 입력해주세요."
              :max-length="30"
              :validate="rule.input"
              v-model="text"
            />
          </div>
          <div class="col">
            <SelectBox
              block
              multiple
              observer
              label="안쪽에 라벨 표시"
              placeholder="표시되는 내용"
              :options="opt"
              :is-loading="observerLoading"
              @observe="selectBoxObserved"
              v-model="selectMulti"
            />
          </div>
          <div class="col-3"></div>
          <div class="col">
            <SelectBox
              block
              multiple
              label="안쪽에 라벨 표시"
              placeholder="표시되는 내용"
              :options="opt"
              v-model="selectMulti"
            />
          </div>
          <div class="col">
            <TextField
              block
              required
              label="유효성 검사 및 필수 입력"
              placeholder="이곳에 텍스트를 입력해주세요."
              :max-length="30"
              :validate="rule.input"
              v-model="text"
            />
          </div>
        </div>
      </div>
    </div>

    <ValidateForm ref="form1">
      <div class="card mt-15">
        <div class="card-header h3">
          TextField
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col">
              <TextField
                block
                label="기본 입력"
                placeholder="이곳에 텍스트를 입력해주세요."
                v-model="text"
              />
            </div>
            <div class="col">
              <TextField
                block
                required
                clearable
                label="유효성 검사 및 필수 입력"
                placeholder="이곳에 텍스트를 입력해주세요."
                :max-length="30"
                :validate="rule.input"
                v-model="text"
              />
            </div>
            <div class="col">
              <TextField
                block
                required
                clearable
                type="password"
                label="비밀번호 타입"
                placeholder="이곳에 텍스트를 입력해주세요."
                :max-length="30"
                :validate="rule.input"
                v-model="text"
              />
            </div>
          </div>
          <div class="row mt-2">
            <div class="col">
              <TextField
                block
                required
                is-counting
                clearable
                label="입력 텍스트 카운팅"
                placeholder="이곳에 텍스트를 입력해주세요."
                :max-length="30"
                :validate="rule.input"
                v-model="text"
              />
            </div>
            <div class="col">
              <TextField
                block
                disabled
                label="사용 불가"
                placeholder="데이터 입력 불가 (validate 적용 안됨)"
                :validate="rule.input"
                v-model="text"
              />
            </div>
            <div class="col">
              <TextField
                block
                required
                hide-message
                clearable
                label="버튼과 함께"
                placeholder="하단에 메시지가 표시 되지 않습니다."
                :validate="rule.input"
                v-model="text"
              >
                <StyledButton color="primary" @click="withButtonClick">
                  button
                </StyledButton>
              </TextField>
            </div>
          </div>
          <div class="row mt-2">
            <div class="col">
              <TextField
                block
                icon-left
                clearable
                label="왼쪽에 아이콘 표시"
                placeholder="왼쪽에 아이콘이 표시 됩니다."
                :icon="mdiPencilBoxMultiple"
                :validate="rule.input"
                v-model="text"
              />
            </div>
            <div class="col">
              <TextField
                block
                clearable
                placeholder="오른쪽에 아이콘이 표시 됩니다."
                label="오른쪽 아이콘 표시"
                :icon="mdiMagnify"
                :icon-action="() => Toast('icon action!!!')"
                :validate="rule.input"
                v-model="text"
              />
            </div>
          </div>
          <div class="row mt-15">
            <div class="col">
              <TextField
                block
                multiline
                is-counting
                clearable
                label="멀티 라인 입력"
                placeholder="여러줄 입력 가능합니다."
                :max-length="10"
                :rows="10"
                v-model="textarea"
              />
            </div>
          </div>

          <div class="row mt-15">
            <div class="col text-center">
              <StyledButton
                block
                tag="button"
                color="primary"
                @click.prevent="checkForm()"
              >
                폼 체크하기
              </StyledButton>
            </div>
          </div>
        </div>
      </div>
    </ValidateForm>

    <ValidateForm ref="form2">
      <div class="card mt-15">
        <div class="card-header h3">
          NumberFormat
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col">
              <NumberFormat
                block
                required
                label="금액"
                placeholder="숫자만 입력해주세요."
                :validate="rule.input"
                v-model="num"
              />
            </div>
            <div class="col">
              <NumberFormat
                block
                disabled
                label="금액"
                placeholder="숫자만 입력해주세요."
                :validate="rule.input"
                v-model="num"
              />
            </div>
            <div class="col">
              <NumberFormat
                block
                required
                hide-message
                label="하단 메시지 표시 안함"
                placeholder="숫자만 입력해주세요."
                :validate="rule.input"
                v-model="num"
              />
            </div>
          </div>
          <div class="row">
            <div class="col mt-5">
              <StyledButton block color="primary" @click.prevent="checkForm(1)">
                폼 체크하기
              </StyledButton>
            </div>
          </div>
        </div>
      </div>
    </ValidateForm>

    <ValidateForm ref="form3">
      <div class="card mt-15">
        <div class="card-header h3">
          SelectBox
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col">
              <SelectBox
                block
                required
                clearable
                label="기본 형태"
                placeholder="스타일을 선택해주세요."
                :validate="rule.select"
                :options="opt"
                v-model="select"
              />
            </div>
            <div class="col">
              <SelectBox
                block
                required
                multiple
                is-short
                clearable
                label="다중 선택"
                placeholder="스타일을 선택해주세요."
                :validate="rule.selectMulti"
                :options="opt"
                v-model="selectMulti"
              />
            </div>
            <div class="col">
              <SelectBox
                block
                required
                searchable
                hide-message
                clearable
                label="옵션 검색 기능"
                placeholder="스타일을 선택해주세요."
                :validate="rule.select"
                :options="opt"
                v-model="select"
              />
            </div>
            <div class="col">
              <SelectBox
                block
                multiple
                label-text
                is-short
                btn-accept
                clearable
                label="적용 버튼 추가(다중 선택에서만 가능)"
                placeholder="선택 후 적용 버튼을 클릭 하지 않으면 초기화 됩니다."
                :options="opt"
                v-model="selectMulti"
              />
            </div>
          </div>
          <div class="row mt-15">
            <div class="col">
              <SelectBox
                block
                searchable
                multiple
                hide-message
                clearable
                label="옵션 검색 기능"
                placeholder="스타일을 선택해주세요."
                :options="opt"
                v-model="selectMulti"
              />
            </div>
            <div class="col">
              <SelectBox
                block
                multiple
                label-text
                btn-accept
                clearable
                label="적용 버튼 추가(다중 선택에서만 가능)"
                placeholder="선택 후 적용 버튼을 클릭 하지 않으면 초기화 됩니다."
                :options="opt"
                v-model="selectMulti"
              />
            </div>
            <div class="col">
              <SelectBox
                block
                clearable
                observer
                label="observer 기능"
                placeholder="마지막 옵션이 노출되면 observe 이벤트 발생"
                :is-loading="observerLoading"
                :options="opt"
                @observe="selectBoxObserved"
                v-model="select"
              />
            </div>
            <div class="col">
              <SelectBox
                block
                multiple
                in-label
                clearable
                label="안쪽에 라벨 표시"
                placeholder="inline label 표시"
                :options="opt"
                v-model="selectMulti"
              />
            </div>
          </div>
          <div class="row">
            <div class="col mt-15 text-center">
              <StyledButton block color="primary" @click.prevent="checkForm(2)">
                폼 체크하기
              </StyledButton>
            </div>
          </div>
        </div>
      </div>
    </ValidateForm>

    <ValidateForm ref="form4">
      <div class="card mt-15">
        <div class="card-header h3">
          DatePicker
        </div>
        <div class="card-body">
          <div class="row mt-15">
            <div class="col">
              <DatePicker
                block
                required
                separator="/"
                label="생일(날짜 구분 /)"
                placeholder="날짜 선택"
                :validate="rule.input"
                v-model="date1"
              />
            </div>
            <div class="col">
              <DatePicker
                block
                hide-message
                separator="."
                label="생일(날짜 구분 .)"
                placeholder="날짜 선택"
                :validate="rule.input"
                v-model="date2"
              />
            </div>
            <div class="col">
              <DatePicker
                block
                readonly
                separator="."
                label="읽기 전용"
                placeholder="날짜 선택"
                v-model="date2"
              />
            </div>
            <div class="col">
              <DatePicker
                disabled
                block
                range
                label="사용 불가"
                :placeholder="['시작일 선택', '종료일 선택']"
                :max-range="30"
                :validate="rule.input"
                v-model="rangeDate"
              />
            </div>
            <div class="col">
              <DatePicker
                block
                range
                label="서비스 기간 (날짜 구분 기본)"
                :placeholder="['시작일 선택', '종료일 선택']"
                :max-range="30"
                :validate="rule.input"
                v-model="rangeDate"
              />
            </div>
          </div>
          <div class="row mt-15">
            <div class="col text-center">
              <StyledButton block color="warning" @click.prevent="inDate()">
                날짜 초기화
              </StyledButton>
            </div>
            <div class="col text-center">
              <StyledButton block color="info" @click.prevent="inDate(false)">
                날짜 넣기
              </StyledButton>
            </div>
            <div class="col text-center">
              <StyledButton block color="primary" @click.prevent="checkForm(3)">
                폼 체크하기
              </StyledButton>
            </div>
          </div>
        </div>
      </div>
    </ValidateForm>

    <ValidateForm ref="form5">
      <div class="card mt-15">
        <div class="card-header h3">
          CheckButton
        </div>
        <div class="card-body">
          <div class="row mt-4">
            <div class="col">
              <CheckButton
                block
                name="checkbutton"
                :max-length="3"
                :validate="rule.check"
                :items="items"
                v-model="checked"
              />
            </div>
            <div class="col">
              <CheckButton
                block
                type="radio"
                color="success"
                name="checkbutton2"
                :validate="rule.select"
                :items="items"
                v-model="radio"
              />
            </div>
          </div>
          <div class="row mt-4">
            <div class="col">
              <CheckButton
                disabled
                name="checkbutton3"
                color="info"
                :max-length="3"
                :validate="rule.check"
                :items="items"
                v-model="checked2"
              />
            </div>
            <div class="col">
              <CheckButton
                disabled
                type="radio"
                color="secondary"
                name="checkbutton4"
                :validate="rule.select"
                :items="items"
                v-model="radio2"
              />
            </div>
          </div>
          <div class="row mt-15">
            <div class="col">
              <CheckButton
                button
                color="warning"
                name="checkbutton5"
                :validate="rule.check"
                :items="items"
                v-model="btnChecked"
              />
            </div>
            <div class="col">
              <CheckButton
                button
                disabled
                color="danger"
                name="checkbutton6"
                :validate="rule.check"
                :items="items"
                v-model="btnChecked2"
              />
            </div>
          </div>
          <div class="row">
            <div class="col mt-15 text-center">
              <StyledButton block color="primary" @click.prevent="checkForm(4)">
                폼 체크하기
              </StyledButton>
            </div>
          </div>
        </div>
      </div>
    </ValidateForm>

    <ValidateForm ref="form6">
      <div class="card mt-15">
        <div class="card-header h3">
          SwitchButton
        </div>
        <div class="card-body">
          <div class="row mt-2">
            <div class="col">
              <SwitchButton
                true-value="Y"
                false-value="N"
                validate="설정해야 합니다!"
                v-model="switchYN"
              />
            </div>
            <div class="col">
              <SwitchButton
                small
                readonly
                color="success"
                :label="['꺼짐', '켜짐']"
                v-model="switchBool"
              />
            </div>
            <div class="col">
              <SwitchButton
                checkbox
                color="danger"
                placeholder="체크박스 형태 스위치 버튼"
                v-model="switchBool"
              />
            </div>
          </div>
          <div class="row">
            <div class="col mt-15 text-center">
              <StyledButton block color="primary" @click.prevent="checkForm(5)">
                폼 체크하기
              </StyledButton>
            </div>
          </div>
        </div>
      </div>
    </ValidateForm>

    <div class="card mt-15">
      <div class="card-header h3">
        Buttons
      </div>
      <div class="card-body">
        <div class="row">
          <div :key="`color-${index}`" class="col" v-for="(color, index) in buttonColors">
            <StyledButton block :color="color">
              color: {{ color }}
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton block outline>
              outline
            </StyledButton>
          </div>
        </div>
        <div class="row mt-15">
          <div :key="`color2-${index}`" class="col" v-for="(color, index) in buttonColors">
            <StyledButton block disabled :color="color">
              color: {{ color }}
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton block disabled outline>
              outline
            </StyledButton>
          </div>
        </div>
        <div class="row mt-15">
          <div class="col">
            <StyledButton large color="primary">
              Size Large
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton color="success">
              Size Normal
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton small color="warning">
              Size Small
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton x-small color="danger">
              Size XSmall
            </StyledButton>
          </div>
        </div>
        <div class="row mt-15 py-15">
          <div :key="`list-${index}`" class="col" v-for="(color, index) in buttonColors">
            <StyledButton
              text
              :icon-right="index % 2 !== 0"
              :icon="mdiPencil"
              :color="color"
            >
              color: {{ color }}
            </StyledButton>
          </div>
        </div>
        <div class="row mt-15">
          <div class="col">
            <StyledButton block color="primary" :icon="mdiDownload">
              with icon (left)
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton
              block
              icon-right
              color="success"
              :icon="mdiUpload"
            >
              with icon (right)
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton
              block
              color="warning"
              :loading="isLoading"
              @click="showLoading"
            >
              클릭하면 5초간 스피너가 보이고 disabled 됩니다.
            </StyledButton>
          </div>
        </div>
        <div class="row mt-15">
          <div class="col flex justify-around">
            <div>
              <StyledButton
                only-icon
                large
                color="primary"
                :icon="mdiUpload"
              />
              Large
            </div>
            <div>
              <StyledButton only-icon color="primary" :icon="mdiUpload" />
              Normal
            </div>
            <div>
              <StyledButton
                only-icon
                small
                color="success"
                :icon="mdiReply"
              />
              Small
            </div>
            <div>
              <StyledButton
                only-icon
                x-small
                color="info"
                :icon="mdiPower"
              />
              X-Small
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-15">
      <div class="card-header h3">
        Drop Menu
      </div>
      <div class="card-body">
        <div class="row mt-2">
          <div class="col">
            <DropMenu
              v-slot="{ toggle }"
              color="primary"
              :width="300"
              :items="dropMenuItem"
            >
              <StyledButton
                icon-right
                color="primary"
                :icon="mdiChevronDown"
                :drop-menu-toggle="toggle"
              >
                드롭 메뉴(slide) 보기
              </StyledButton>
            </DropMenu>
          </div>
          <div class="col">
            <DropMenu
              v-slot="{ toggle }"
              color="success"
              :position="dropMenuPosition.left"
              :transition="dropMenuTransition.scale"
              :items="dropMenuItem"
            >
              <StyledButton
                color="info"
                :icon="mdiChevronDown"
                :drop-menu-toggle="toggle"
              >
                메뉴 왼쪽(scale) 보기
              </StyledButton>
            </DropMenu>
          </div>
          <div class="col">
            <DropMenu
              v-slot="{ toggle }"
              color="info"
              :position="dropMenuPosition.right"
              :transition="dropMenuTransition.fade"
              :items="dropMenuItem"
            >
              <StyledButton
                icon-right
                color="success"
                :icon="mdiChevronDown"
                :drop-menu-toggle="toggle"
              >
                메뉴 오른쪽(fade) 보기
              </StyledButton>
            </DropMenu>
          </div>
          <div class="col">
            <DropMenu
              v-slot="{ toggle }"
              color="secondary"
              :position="dropMenuPosition.top"
              :items="dropMenuItem"
            >
              <StyledButton
                icon-right
                color="secondary"
                :icon="mdiChevronUp"
                :drop-menu-toggle="toggle"
              >
                메뉴 위쪽 보기
              </StyledButton>
            </DropMenu>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-15">
      <div class="card-header h3">
        Message
      </div>
      <div class="card-body">
        <div class="row mt-2">
          <div class="col">
            <StyledButton block color="dark" @click.prevent="MessageBoxAlert()">
              알림창 보기
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton block color="secondary" @click.prevent="MessageBoxAlert('confirm')">
              승인창 보기
            </StyledButton>
          </div>
        </div>
        <div class="row mt-10">
          <div class="col">
            <StyledButton block color="success" @click.prevent="showToast('success')">
              토스트 메시지 보기
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton block color="info" @click.prevent="showToast('info')">
              토스트 메시지 보기
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton block color="warning" @click.prevent="showToast('warning')">
              토스트 메시지 보기
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton block color="danger" @click.prevent="showToast('danger')">
              토스트 메시지 보기
            </StyledButton>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-15">
      <div class="card-header h3">
        Badge
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col px-5 text-center">
            <Badge color="warning" position="left" text="5">
              <StyledButton block outline>
                뱃지 좌측 상단
              </StyledButton>
            </Badge>
          </div>
          <div class="col px-5 text-center">
            <Badge text="5">
              <StyledButton block outline>
                뱃지 우측 상단(기본)
              </StyledButton>
            </Badge>
          </div>
          <div class="col px-5 text-center">
            <Badge color="info" position="bottom-left" text="5">
              <StyledButton block outline>
                뱃지 좌측 하단
              </StyledButton>
            </Badge>
          </div>
          <div class="col px-5 text-center">
            <Badge color="primary" position="bottom-right" text="5">
              <StyledButton block outline>
                뱃지 우측 하단
              </StyledButton>
            </Badge>
          </div>
        </div>
        <div class="row mt-15">
          <div class="col px-5 text-center">
            <Badge
              large
              color="warning"
              position="left"
              text="5"
            >
              <StyledButton block outline>
                큰 뱃지 좌측 상단
              </StyledButton>
            </Badge>
          </div>
          <div class="col px-5 text-center">
            <Badge large text="5">
              <StyledButton block outline>
                큰 뱃지 우측 상단(기본)
              </StyledButton>
            </Badge>
          </div>
          <div class="col px-5 text-center">
            <Badge
              large
              color="info"
              position="bottom-left"
              :icon="mdiBellAlertOutline"
            >
              <StyledButton block outline>
                큰 뱃지 아이콘 좌측 하단
              </StyledButton>
            </Badge>
          </div>
          <div class="col px-5 text-center">
            <Badge
              large
              color="primary"
              position="bottom-right"
              :icon="mdiBellAlertOutline"
            >
              <StyledButton block outline>
                큰 뱃지 아이콘 우측 하단
              </StyledButton>
            </Badge>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header h3">
        Tooltip
      </div>
      <div class="card-body">
        <div class="row mt-2">
          <div class="col">
            <Tooltip
              block
              left
              hovering
              message="각 방향 메시지"
            >
              <StyledButton block color="primary">왼쪽</StyledButton>
            </Tooltip>
          </div>
          <div class="col">
            <Tooltip
              block
              right
              hovering
              message="각 방향 메시지"
            >
              <StyledButton block color="primary">오른쪽</StyledButton>
            </Tooltip>
          </div>
          <div class="col">
            <Tooltip
              block
              top
              hovering
              message="각 방향 메시지"
            >
              <StyledButton block color="primary">위쪽</StyledButton>
            </Tooltip>
          </div>
          <div class="col">
            <Tooltip block hovering message="각 방향 메시지">
              <StyledButton block color="primary">아래쪽</StyledButton>
            </Tooltip>
          </div>
        </div>
        <div class="row mt-25">
          <div class="col text-center">
            <Tooltip right hovering message="이건 툴팁입니다.">
              <SvgIcon type="mdi" size="30" :path="mdiAlert" />
              마우스를 올리면 툴팁이 보입니다.
            </Tooltip>
          </div>
          <div class="col">
            <div class="row justify-center">
              오른쪽 아이콘을 클릭 해주세요.
              <Tooltip
                bottom
                icon-size="24px"
                message="이컨 툴팁입니다."
              />
            </div>
          </div>
          <div class="col text-center">
            <Tooltip
              left
              hovering
              icon-size="24px"
              title="왼쪽에서 나옵니다."
              :icon="mdiInformationVariantCircle"
              :message="['이건 툴팁입니다.', '툴팁의 방향을 조절해주세요.']"
            />
          </div>
          <div class="col text-center">
            <Tooltip
              top
              btn-close
              icon-size="24px"
              title="위에서 보여집니다."
              :icon="mdiArrowCollapseUp"
              :message="['이건 툴팁입니다.', '툴팁의 방향을 조절해주세요.']"
            />
          </div>
        </div>
        <div class="row mt-25">
          <div class="col text-center">
            <Tooltip
              dark
              bottom
              hovering
              message="dreaminsight_javascript.ts"
            >
              <div class="file-box">
                <SvgIcon type="mdi" size="80" :path="mdiFileCodeOutline" />
                <p>dreaminsight_javascript.ts</p>
              </div>
            </Tooltip>
          </div>
          <div class="col text-center">
            <Tooltip bottom name="tooltipcontent">
              <template #default="{ toggle }">
                <div @click="toggle">
                  <SvgIcon :path="mdiMessageBadgeOutline" />
                  <p>사용자에 의해 작성된 Tooltip 내용을 반영 합니다.</p>
                </div>
              </template>
              <template #content>
                <div class="content-wrapper">
                  <ul>
                    <li>연락처 :</li>
                    <ol>
                      <li>0자 미만인 경우 ex) 010223333</li>
                      <li>앞 3자리가 010인데 10자 이하일 경우 ex) 0103247532</li>
                      <li>앞 4번째 자리가 1 또는 0일 경우 ex) 01012345678, 01002223333</li>
                      <li>앞 3자리가 010이 아닌데 11자일 경우 ex) 01622223333</li>
                    </ol>
                    <li>숫자가 외 다른 문자 입력 시</li>
                    <li>이 존재하지 않을 경우</li>
                    <li>이름 : 값이 존재하지 않을 경우</li>
                    <li>매체코드 : [광고/매체 코드 ▶ 매체 코드 관리] 화면에 등록되어 있지 않은 매체 코드명 입력 시</li>
                    <li>중복 : [고객 DB 관리 ▶ DB 필터 관리] 화면에 설정된 ‘중복’ 기준에 해당 시</li>
                    <li>차단 : [고객 DB 관리 ▶ DB 필터 관리] 화면에 등록된 ‘차단 연락처’ 정보와 동일한 연락처일 경우</li>
                    <li>
                      단어 : [페이지 관리 ▶ DB 항목 설정] 화면에 단어 필터링 ‘활성화’ 상태의 입력 항목에서
                      [고객 DB 관리 ▶ DB 필터 관리] 화면에 등록된 ‘단어 필터링’ 값이 포함되어 있을 경우
                    </li>
                  </ul>
                </div>
              </template>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-15">
      <div class="card-header h3">
        Spinner
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col mt-15 text-center">
            <StyledButton block color="secondary" @click="showSpinner()">
              스피너 보기
            </StyledButton>
          </div>
          <div class="col mt-15 text-center">
            <StyledButton block color="dark" @click="showSpinner(3, 5)">
              스피너 3초후 5초간 보기
            </StyledButton>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-15">
      <div class="card-header h3">
        Modal
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col">
            <StyledButton
              block
              color="primary"
              :icon="mdiOpenInNew"
              @click="showModal('popup')"
            >
              모달 팝업 보기
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton
              block
              color="success"
              :icon="mdiArrowExpandLeft"
              @click="showModal('right')"
            >
              모달 팝업 오른쪽에서 보기
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton
              block
              color="info"
              :icon="mdiArrowExpandRight"
              @click="showModal('left')"
            >
              모달 팝업 왼쪽에서 보기
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton
              block
              color="warning"
              :icon="mdiArrowExpand"
              @click="showModal('bottom')"
            >
              모달 팝업 하단에서 보기
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton
              block
              color="danger"
              :icon="mdiFullscreen"
              @click="showModal('cover')"
            >
              모달 전체 덮기
            </StyledButton>
          </div>
        </div>
      </div>
    </div>

    <div class="card mt-15">
      <div class="card-header h3">
        List Table
      </div>
      <div class="card-body">
        <ListTable
          observer
          check-all
          ref="listTable"
          :width="2500"
          :height="600"
          :header="tableHeader"
          :items="list"
          :loading="dataLoading"
          @observe="getData"
          @checked="checkAll"
        >
          <template #items="{ props }: ListTableItemSlot<any>">
            <tr :key="`list-${props.db_idx}`">
              <td>
                <ListTableCheckbox
                  name="list"
                  :value="props.db_idx"
                  :is-checked="checkList.includes(props.db_idx)"
                  @checked="listTableCheck"
                />
              </td>
              <td>{{ props.db_idx }}</td>
              <td>{{ props.mb_name }}</td>
              <td>{{ props.mda_name }}</td>
              <td>
                <StyledButton
                  text
                  color="primary"
                  :href="props.referer"
                  :icon="mdiPencil"
                >
                  {{ props.referer }}
                </StyledButton>
              </td>
              <td>{{ props.ip }}</td>
              <td class="right">
                {{ props.reg_date }}
              </td>
              <td class="center">
                <StyledButton
                  only-icon
                  small
                  color="primary"
                  :icon="mdiPencil"
                >
                  수정
                </StyledButton>
                &nbsp;
                <StyledButton
                  only-icon
                  small
                  color="warning"
                  :icon="mdiTrashCan"
                >
                  삭제
                </StyledButton>
              </td>
            </tr>
          </template>
        </ListTable>

        <div class="row mt-10">
          <div class="col">
            <StyledButton block color="primary" @click="listTableEvent(0)">
              스크롤 감지 시작
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton block color="danger" @click="listTableEvent(1)">
              스크롤 감지 해제
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton block color="info" @click="listTableEvent(2)">
              체크 ON
            </StyledButton>
          </div>
          <div class="col">
            <StyledButton block color="secondary" @click="listTableEvent(3)">
              체크 OFF
            </StyledButton>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Modal
    ref="modalPopup"
    name="inpopup-content"
    title="모달 overflow layer popup 테스트"
    width="800px"
    v-model="isShow.popup"
    v-if="isShow.popup"
  >
    <template #body>
      <div class="mb-20">
        <Tooltip right>
          <template #default="{ toggle }">
            <div class="flex" @click="toggle">
              <SvgIcon type="mdi" :path="mdiMessageBadgeOutline" />
              <p>사용자에 의해 작성된 Tooltip 내용을 반영 합니다.</p>
            </div>
          </template>
          <template #content>
            <div class="content-wrapper">
              <ul>
                <li>연락처 :</li>
                <ol>
                  <li>0자 미만인 경우 ex) 010223333</li>
                  <li>앞 3자리가 010인데 10자 이하일 경우 ex) 0103247532</li>
                  <li>앞 4번째 자리가 1 또는 0일 경우 ex) 01012345678, 01002223333</li>
                  <li>앞 3자리가 010이 아닌데 11자일 경우 ex) 01622223333</li>
                </ol>
                <li>숫자가 외 다른 문자 입력 시</li>
                <li>이 존재하지 않을 경우</li>
                <li>이름 : 값이 존재하지 않을 경우</li>
                <li>매체코드 : [광고/매체 코드 ▶ 매체 코드 관리] 화면에 등록되어 있지 않은 매체 코드명 입력 시</li>
                <li>중복 : [고객 DB 관리 ▶ DB 필터 관리] 화면에 설정된 ‘중복’ 기준에 해당 시</li>
                <li>차단 : [고객 DB 관리 ▶ DB 필터 관리] 화면에 등록된 ‘차단 연락처’ 정보와 동일한 연락처일 경우</li>
                <li>단어 : [페이지 관리 ▶ DB 항목 설정] 화면에 단어 필터링 ‘활성화’ 상태의 입력 항목에서 [고객 DB 관리 ▶ DB 필터 관리] 화면에 등록된 ‘단어 필터링’ 값이 포함되어 있을 경우</li>
              </ul>
            </div>
          </template>
        </Tooltip>
      </div>

      <div class="modal-section">
        <Tooltip
          right
          name="inpopup-small"
          padding="5px"
          :message="['중복 : [고객 DB 관리 ▶ DB 필터 관리] 화면에 설정된 ‘중복’ 기준에 해당 시', '차단 : [고객 DB 관리 ▶ DB 필터 관리] 화면에 등록된 ‘차단 연락처’ 정보와 동일한 연락처일 경우']"
        />
      </div>

      <div class="section-title mb-5">
        Section title
      </div>

      <div class="modal-section">
        <TextField
          block
          required
          label="input1"
          placeholder="textfield 1"
          v-model="modal.text1"
        />
      </div>
      <div class="modal-section">
        <TextField
          block
          required
          label="input2"
          placeholder="textfield 2"
          v-model="modal.text2"
        />
      </div>

      <div class="mdoal-section">
        <CheckButton
          block
          required
          label="checkbox 1"
          color="warning"
          name="checkbutton10"
          :validate="rule.check"
          :items="items"
          v-model="btnChecked"
        />
      </div>

      <div class="divider mb-20"></div>

      <div class="section-title mt-20 mb-5">
        Section title
      </div>

      <div class="modal-section">
        <SelectBox
          block
          required
          label="기본 형태"
          placeholder="스타일을 선택해주세요."
          :validate="rule.select"
          :options="opt"
          v-model="select"
        />
      </div>
      <div class="modal-section">
        <SelectBox
          block
          required
          multiple
          is-short
          label="다중 선택"
          placeholder="스타일을 선택해주세요."
          :validate="rule.selectMulti"
          :options="opt"
          v-model="selectMulti"
        />
      </div>

      <div class="mdoal-section">
        <CheckButton
          block
          required
          type="radio"
          label="radio 2"
          color="warning"
          name="checkbutton11"
          :validate="rule.check"
          :items="items"
          v-model="radio3"
        />
      </div>

      <div class="divider"></div>

      <div class="section-title mt-20 mb-5">
        Section title
      </div>

      <div class="modal-section">
        <DatePicker
          block
          label="하루만 골라"
          :validate="rule.input"
          v-model="date1"
        />
      </div>
      <div class="modal-section">
        <DatePicker
          block
          range
          label="서비스 기간 (날짜 구분 기본)"
          :placeholder="['시작일 선택', '종료일 선택']"
          :max-range="30"
          :validate="rule.input"
          v-model="rangeDate"
        />
      </div>

      <div class="mdoal-section">
        <CheckButton
          button
          required
          type="radio"
          label="radio 3"
          color="warning"
          name="checkbutton12"
          :validate="rule.check"
          :items="items"
          v-model="radio3"
        />
      </div>

      <div class="divider"></div>

    </template>
    <template #action="{ close }">
      <StyledButton outline @click="close()">
        닫기
      </StyledButton>
      &nbsp;&nbsp;
      <StyledButton color="primary">
        확인
      </StyledButton>
    </template>
  </Modal>

  <Modal
    esc-close
    title="오른쪽에서 나오는 모달"
    position="right"
    width="40em"
    v-model="isShow.right"
    v-if="isShow.right"
  >
    <template #body>
      무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.
    </template>
    <template #action="{ close }">
      <StyledButton outline @click="close()">
        닫기
      </StyledButton>
      &nbsp;&nbsp;
      <StyledButton color="primary">
        확인
      </StyledButton>
    </template>
  </Modal>

  <Modal
    title="왼쪽에서 나오는 모달"
    position="left"
    width="250px"
    v-model="isShow.left"
    v-if="isShow.left"
  >
    <template #body>
      무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.
    </template>
    <template #action="{ close }">
      <StyledButton outline @click="close()">
        닫기
      </StyledButton>
      &nbsp;&nbsp;
      <StyledButton color="primary">
        확인
      </StyledButton>
    </template>
  </Modal>

  <Modal
    title="하단에서 나오는 모달"
    position="bottom"
    @dispose="isShow.bottom = false"
    v-model="isShow.bottom"
    v-if="isShow.bottom"
  >
    <template #body>
      무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.
    </template>
    <template #action="{ close }">
      <StyledButton outline @click="close()">
        닫기
      </StyledButton>
      &nbsp;&nbsp;
      <StyledButton color="primary">
        확인
      </StyledButton>
    </template>
  </Modal>

  <Modal
    screen-cover
    esc-close
    title="화면 전체 덮기"
    position="bottom"
    v-model="isShow.cover"
    v-if="isShow.cover"
  >
    <template #body>
      무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.무궁화 꽃이 피었습니다.<br />

      <br />
      <StyledButton block color="danger" @click.prevent="showToast('danger')">
        토스트 메시지 보기
      </StyledButton>
      <br />
      <StyledButton block color="dark" @click.prevent="MessageBoxAlert()">
        알림창 보기
      </StyledButton>
      <br />
      <StyledButton block color="secondary" @click="showSpinner()">
        스피너 보기
      </StyledButton>
      <br />
      <StyledButton block color="info" @click="isShow.in = true">
        모달에서 모달 열기
      </StyledButton>

      <Modal
        esc-close
        ref="inModal"
        title="모달안의 모달"
        width="300px"
        @dispose="isShow.in = false"
        v-model="isShow.in"
      >
        <template #body>
          와우~~~~
        </template>
      </Modal>
    </template>
    <template #action="{ close }">
      <StyledButton outline @click="close()">
        닫기
      </StyledButton>
      &nbsp;&nbsp;
      <StyledButton color="primary">
        확인
      </StyledButton>
    </template>
  </Modal>
</template>

<style lang="scss">
.file-box {
  width: 100px;

  span {
    font-size: 80px;
  }

  p {
    width: 100px;
    padding: 0 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.content-wrapper {
  padding: 10px;

  ul {
    width: 500px;
    padding-left: 16px;
    font-size: 14px;

    & > li {
      list-style: outside;
    }

    ol {
      padding-left: 16px;

      li {
        list-style: circle outside;
      }
    }
  }
}
</style>
