import { inject } from 'vue';
import { v1 as uuid } from 'uuid';

import { useSmartEditorApi } from '@/api/modules/smartEditorApi';
import type { PostCopyPagesParam, PostCopyLayoutsParam, PostCopyScriptsParam, PostCopyTermsParam } from '@/types/api/smartEditorApi';
import { COPY_MODE } from '@/constants/smart';
import type { CopyPropsData, COPY_MODE_TYPE } from '@/types/smart';
import { postCopyPagesMsg, postCopyLayoutsMsg, postCopyScriptsMsg, postCopyTermsMsg } from '@/constants/api/smartEditorApi';
import type { ToastModel } from '@/components/Toast/types';

const smartEditorApi = useSmartEditorApi();

const Toast = inject('Toast') as ToastModel;

export const useCopy = async (type: COPY_MODE_TYPE, data: CopyPropsData, _callback: Function) => {
  const _errors = (err: Error): void => {
    console.error(err);
    // 이벤트 실패시 기본 에러 처리 수행
    Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });
  };

  const pageCopy = async (): Promise<void> => {
    const params: PostCopyPagesParam = {
      pageUid: uuid(),
      pageName: data.name
    };
    const { code, results } = await smartEditorApi.postCopyPages(data.uid, params);
    code === postCopyPagesMsg.SMART_PAGE_COPY_SUCCESS ? _callback(params.pageUid, results) : _errors;
  };

  const layoutCopy = async (): Promise<any> => {
    const params: PostCopyLayoutsParam = {
      layoutUid: uuid(),
      layoutName: data.name
    };
    const { code } = await smartEditorApi.postCopyLayouts(data.uid, params);
    code === postCopyLayoutsMsg.SMART_LAYOUT_COPY_SUCCESS ? _callback(params.layoutUid) : _errors;
  };

  const scriptCopy = async (): Promise<any> => {
    const params: PostCopyScriptsParam = {
      scriptUid: uuid(),
      scriptName: data.name
    };
    const { code } = await smartEditorApi.postCopyScripts(data.uid, params);
    code === postCopyScriptsMsg.SMART_SCRIPT_COPY_SUCCESS ? _callback(params.scriptUid) : _errors;
  };

  const termsCopy = async (): Promise<any> => {
    const params: PostCopyTermsParam = {
      termsPageUid: uuid(),
      pageName: data.name
    };
    const { code, results } = await smartEditorApi.postCopyTerms(data.uid, params);
    code === postCopyTermsMsg.SMART_TERMS_PAGE_COPY_SUCCESS ? _callback(params.termsPageUid, results.pageCode) : _errors;
  };

  switch (type) {
    case COPY_MODE.PAGE: {
      await pageCopy();
    } break;
    case COPY_MODE.LAYOUT: {
      await layoutCopy();
    } break;
    case COPY_MODE.SCRIPT: {
      await scriptCopy();
    } break;
    case COPY_MODE.TERMS: {
      await termsCopy();
    } break;
  }
};
