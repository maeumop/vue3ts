import { _isContains, useToast } from '@/js/helper/common';

import type { DeleteSmartCompResType } from '@/types/smart/component/index';
import type { MessageBoxModel } from '@/components/MessageBox/types';
import type { ToastModel } from '@/components/Toast/types';
import { apiErrorCode } from '@/message/apiResponse';
import axios from 'axios';
import { inject } from 'vue';
import { useUtil } from '@/js/util';

export const useMessageBox = (toast?: ToastModel) => {
  const MessageBox = inject('MessageBox') as MessageBoxModel;
  const { Toast, deleteSuccess } = useToast(toast);
  const util = useUtil();

  const _defaultErrors = (err: any): void => {
    util.axiosErrorCatch(err);
  };
  
  /**
  * 스마트 컴포넌트 삭제 MessageBox
  * 스마트 편집 > 컴포넌트 > *
  * @author hjs0620
  * @param {string} componentName 컴포넌트명
  * @param {Function} okayFn MessageBox.btnOkay 콜백함수
  * @returns
  */
  const deleteSmartComponent = (componentName: string = '', okayFn: Function): void => {
    MessageBox.confirm({
      title: `${componentName.josaFormat()} 삭제하시겠습니까?`,
      message:
       '[삭제 처리하기] 버튼 클릭 시 해당 데이터는 삭제되며, 복구가 불가능합니다.',
      btnOkayText: '삭제 처리하기',
      btnCancelText: '취소하기',
      enterOkay: false,
      escCancel: false,
      asyncOkay: async () => {
        try {
          await okayFn();
          deleteSuccess();
        } catch (err) {
          if (axios.isAxiosError<DeleteSmartCompResType, any>(err)) {
            const { response } = err;
            if (response) {
              const { code } = response.data;
              const { SMART_INPUTFORM_USED, SMART_COMPONENT_USED_BY_SECTION } = apiErrorCode;
              if (_isContains(code, [SMART_INPUTFORM_USED, SMART_COMPONENT_USED_BY_SECTION])) {
                await MessageBox.destroy();
                notAllowDeleteSmartComponent(componentName);
                return;
              } 
            }
          }
          _defaultErrors(err);
        }
      },
    });
  };

  /**
  * 스마트 컴포넌트 삭제불가 MessageBox
  * 스마트 편집 > 컴포넌트 > *
  * @author hjs0620
  * @param {Function} okayFn MessageBox.btnOkay 콜백함수
  * @returns
  */
  const notAllowDeleteSmartComponent = (componentName: string = '', okayFn?: Function): void => {
    MessageBox.alert({
      title: '삭제가 불가능합니다.',
      message:
       `해당 ${componentName.josaFormat()} 참조하고 있는 페이지 존재 시 삭제가 불가능합니다.`,
      btnOkayText: '확인',
      enterOkay: false,
      escCancel: false,
      okay: () => {
        try {
          if (okayFn instanceof Function) {
            okayFn();
          }
        } catch (err) {
          _defaultErrors(err);
        }
      },
    });
  };

  /**
     * 이동 중 이동 알림 MessageBox
     * 스마트 편집 > 컴포넌트 > 입력폼 > 입력항목설정
     * @author hjs0620
     * @param {Function} okayFn MessageBox.btnOkay 콜백함수
     * @param {Function} cancelFn MessageBox.btnCancel 콜백함수
     * @returns
     */
  const movementConfirm = (okayFn: Function, cancelFn?: Function): void => {
    MessageBox.confirm({
      title: '수정 항목을 변경하시겠습니까?',
      message:
        '[변경하기] 버튼 클릭 시 수정 항목이 변경되며, 수정 중 항목의 변경 내용은 저장되지 않습니다.',
      btnOkayText: '변경하기',
      btnCancelText: '취소하기',
      enterOkay: false,
      escCancel: false,
      okay: () => {
        try {
          okayFn();
        } catch (err) {
          _defaultErrors(err);
        }
      },
      cancel: () => cancelFn && cancelFn()
    });
  };

  /**
     * 입력 방식 최기화 알림 MessageBox
     * 스마트 편집 > 컴포넌트 > 입력폼 > 입력항목설정
     * @author hjs1005
     * @param {Function} okayFn MessageBox.btnOkay 콜백함수
     * @param {Function} cancelFn MessageBox.btnCancel 콜백함수
     * @returns
     */
  const changeFieldTypeConfirm = (okayFn: Function, cancelFn?: Function): void => {
    MessageBox.confirm({
      title: '입력형식을 변경하시겠습니까?',
      message:
        '입력형식 변경 시 세부 옵션 값은 기본값으로 초기화 됩니다.',
      btnOkayText: '변경하기',
      btnCancelText: '취소하기',
      enterOkay: false,
      escCancel: false,
      okay: () => {
        try {
          okayFn();
        } catch (err) {
          _defaultErrors(err);
        }
      },
      cancel: () => cancelFn && cancelFn()
    });
  };

  /**
  * 삭제 이벤트 함수
  * MessageBox의 btnOkay 콜백함수 적용
  * @author hjs0609
  * @param {string} title 제할 콘텐츠 유형 [ '폴더를' | '파일을' ]
  * @param {Function} okayFn MessageBox.btnOkay 콜백함수
  * @returns
  */
  const deleteFtpContent = (title: string, okayFn: Function): void => {
    MessageBox.confirm({
      title: `${title.josaFormat()} 삭제하시겠습니까?`,
      message:
       '[삭제 처리하기] 버튼 클릭 시 폴더에 포함된 파일들도 삭제되며, 복구가 불가능합니다.',
      btnOkayText: '삭제 처리하기',
      btnCancelText: '취소하기',
      enterOkay: false,
      escCancel: false,
      asyncOkay: async () => {
        try {
          await okayFn();
        } catch (err) {
          _defaultErrors(err);
        }
      },
    });
  };

  /**
  * 가입된 회원이 아닌 MessageBox
  * @author hjs0619
  * @param {Function} okayFn MessageBox.btnOkay 콜백함수
  * @returns
  */
  const notInviteMember = (okayFn: Function): void => {
    MessageBox.confirm({
      title: '가입된 회원이 아닙니다.',
      message:
       '멤버 초대는 가입된 회원만 가능합니다. 초대 하고자 하시는 사용자 회원 가입 후 다시 초대해 주세요.',
      btnOkayText: '회원 가입 안내 메일 발송하기',
      btnCancelText: '다음에 초대하기',
      enterOkay: false,
      escCancel: false,
      asyncOkay: async () => {
        try {
          await okayFn();
          Toast('정상적으로 안내 메일이 발송되었습니다.');
        } catch (err) {
          _defaultErrors(err);
        }
      },
    });
  };

  /**
  * 권한 해제 MessageBox
  * @author hjs0619
  * @param {Function} okayFn MessageBox.btnOkay 콜백함수
  * @returns
  */
  const authRelease = (okayFn: Function): void => {
    MessageBox.confirm({
      title: '권한을 해제하시겠습니까?',
      message:
       '권한 해제 시 해당 사용자는 본 솔루션 화면에 접근할 수 없습니다.',
      btnOkayText: '권한 해제 처리하기',
      btnCancelText: '취소하기',
      enterOkay: false,
      escCancel: false,
      asyncOkay: async () => {
        try {
          await okayFn();
          Toast('정상적으로 해제되었습니다.');
        } catch (err) {
          _defaultErrors(err);
        }
      },
    });
  };

  /**
  * 초대 취소 MessageBox
  * @author hjs0619
  * @param {Function} okayFn MessageBox.btnOkay 콜백함수
  * @returns
  */
  const inviteCancel = (okayFn: Function): void => {
    MessageBox.confirm({
      title: '초대를 취소하시겠습니까?',
      message:
       '초대 취소 시 해당 사용자에게 보낸 초대 요청이 취소됩니다.',
      btnOkayText: '초대 취소하기',
      btnCancelText: '다음에 취소하기',
      enterOkay: false,
      escCancel: false,
      asyncOkay: async () => {
        try {
          await okayFn();
          Toast('정상적으로 취소되었습니다.');
        } catch (err) {
          _defaultErrors(err);
        }
      },
    });
  };

  return { 
    deleteSmartComponent, 
    notAllowDeleteSmartComponent,
    movementConfirm, 
    changeFieldTypeConfirm, 
    deleteFtpContent, 
    notInviteMember,
    authRelease,
    inviteCancel,
  }; 
};