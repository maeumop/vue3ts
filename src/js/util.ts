import { inject } from 'vue';
import { useClientStore, useSessionStore } from '@/store';
import { storeToRefs } from 'pinia';
import { useMemberAccountApi } from '@/api/modules/memberAccountApi';
import type { KeyIndex } from '@/types/common';
import axios from 'axios';
import { getApiErrorMessage } from '@/message/apiResponse';
import type { ToastModel } from '@/components/Toast/types';
import { getMembersClientsMsg, postMembersLoginMsg, patchMembersClientsMsg } from '@/constants/api/memberAccountApi';
import { booleanYN } from '@/constants/common';

class util {
  Toast: ToastModel;

  constructor() {
    this.Toast = inject('Toast') as ToastModel;
  }

  /**
   * v 값이 비어 있을 경우 recover 값으로 반환한다.
   * @param v 값이 있는지 여부를 판단할 변수
   * @param recover 대체할 값
   * @returns
   */
  public ifEmpty(v: string, recover: string): string {
    return v ? v : recover;
  }

  private patterns: KeyIndex<RegExp> = {
    // id: /^[(a-z|A-Z)0-9]+[_]*[(a-z|A-Z)0-9]+$/, //'영문, 숫자 입력만 가능합니다.( _ 중간 사용 가능)'
    hanengnum: /^([ㄱ-ㅎ가-힣|0-9|a-z|A-Z]+)$/,  // '한글,영문, 숫자만 입력 가능합니다.'
    eng: /^[a-z|A-Z]+$/,  // '영문만 입력 가능합니다.'
    engnum: /^[(a-z|A-Z)0-9]+$/, // '영문, 숫자만 입력 가능합니다.'
    han: /^[ㄱ-ㅎ가-힣]+$/, // '한글만 입력가능합니다.'
    id: /^[(a-z|A-Z)0-9]{4,20}$/, //'영문, 숫자 입력만 가능합니다.(4~20자)'
    num: /^[0-9]+$/, // '숫자만 입력 가능합니다.'
    wordnum: /^([0-9]+[a-z|A-Z]+)|([a-z|A-Z]+[0-9]+)$/, // '영문, 숫자 혼합하여 입력해주세요.'
    password: /^((?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9])).{10,16}$/, // '영문, 숫자, 특수문자를 조합하여 입력해주세요.(10~16자)'
    domain: /^(http(s)?:\/\/)([a-zA-Z0-9]{1,}\.?)[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9]{2,})+(?:\:[0-9]{1,})*$/, // '도메인주소 형식이 일치 하지 않습니다.(http://, https:// 제외)'
    url: /^(http(s)?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/, // 'url 형식과 일치하지 않습니다.'
    email: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/, // '이메일 형식과 일치하지 않습니다.'
    tel: /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-?[0-9]{4}-?[0-9]{4}$/, // '전화번호 형식과 일치하지 않습니다.'
    code: /^[a-zA-Z0-9_\-]+$/, // '영문 숫자 (-, _) 영문 숫자'
    jsonKey: /^[a-z|A-Z|0-9|\?.,;:|*~`!^\-_+@\#$%&\=]+$/, // '영문, 숫자, 일부 특수문자(-, _, .)'
    domainName: /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/, // 영문, 숫자, (-)만
    domainWithoutProtocol: /^(?!-)(?!.*--)[a-zA-Z0-9-]+(?<!-)(?:-[a-zA-Z0-9-]+)*(?<!-)\.(co\.kr|kr|net|com)$/, // 프로토콜을 제외한 도메인 (애드메이커 전용)
    domainSearch: /^(?!https?:\/\/)(?!-)(?!.*--)[a-zA-Z0-9-]+(?<!-)$/,
    TLD: /^(?!(http|https):\/\/)([a-zA-Z0-9-]+)(?:\.(co\.kr|kr|net|com))$/, // 입력 가능한 (co.kr, kr, net, com 외에 입력 불가) TLD 정의
  };


  /**
   * 정규화 패턴을 반환 해준다.
   * @param flag 패턴 구분값 [eng, engnum, han, id, num, wordnum, password, domain, url, email, tel, code, jsonKey]
   * @returns
   */
  public getRegExp(flag: string): RegExp {
    if (!this.patterns[flag]) {
      throw '해당 정규식 패턴 타입을 찾을 수 없습니다.';
    }

    return this.patterns[flag];
  }

  /**
   * 소수점 지정 자리이하 버림 처리
   * @param v
   * @param cut
   * @returns
   */
  public cutDot(v: number, cut: number = 0): number {
    const num = parseFloat(v.toString().replace(/,/gi, ''));
    return (cut > 0) ? Number(num.toFixed(cut)) : num;
  }

  /**
   * unix timestamp를 timezone에 맞춰서 날짜 형식으로 반환
   * @param time unixtimestamp
   * @param type DH(날짜 + 시간) | D(날짜) | H(시간)
   * @returns
   */
  public getUnixTimestamp(time: number, type: 'DH' | 'D' | 'H'): string {
    let timeString = '';

    if (time > 0) {
      const offset: number = new Date().getTimezoneOffset();
      const localTime = new Date(time + (offset * 60 * 1000));

      if (type === 'DH') {
        timeString = this.getDateFormat(localTime, 'Y-m-d H:i:s');
      } else if (type === 'D') {
        timeString = this.getDateFormat(localTime, 'Y-m-d');
      } else {
        timeString = this.getDateFormat(localTime, 'H:i:s');
      }
    }

    return timeString;
  }

  /**
   * 날짜 형태를 format 기준으로 형태로 결과를 반환하고,
   * 필요한 경우 일(day) 기준으로 날짜를 증감하 처리한다.
   * @param format (year: Yy, month: Mn, day: dj, hour: Hh, min: iM, sec: sc)
   * @param days 날짜 증감 수치(day 기준)
   * @returns
   */
  public getDateFormat(d: Date | string | number, format: string = 'Y-m-d', days: number = 0): string {
    let val: string = '';
    let date = new Date(d);

    if (date instanceof Date) {
      if (days !== 0) {
        date = new Date(date.getTime() + (86400 * days * 1000));
      }

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dMonth: string = (month < 10) ? `0${month}` : month.toString();
      const dDay: string = (day < 10) ? `0${day}` : day.toString();

      val = format
        .replace('Y', year.toString())
        .replace('m', dMonth.toString())
        .replace('d', dDay)
        .replace('y', year.toString().substr(0, 2))
        .replace('n', month.toString())
        .replace('j', day.toString());

      const hours: number = date.getHours();
      const min: number = date.getMinutes();
      const sec: number = date.getSeconds();
      const dHours: string = (hours < 10) ? `0${hours}` : hours.toString();
      const dMin: string = (min < 10) ? `0${min}` : min.toString();
      const dSec: string = (sec < 10) ? `0${sec}` : sec.toString();

      val = val
        .replace('H', dHours)
        .replace('i', dMin)
        .replace('s', dSec)
        .replace('h', hours.toString())
        .replace('M', min.toString())
        .replace('c', sec.toString());
    }

    return val;
  }

  /**
   * 두 인자의 날짜 차이를 반환
   * a 날짜가 클 경우 양수, b 날짜가 클 경우 음수로 반환
   * @param a 비교 날짜
   * @param b 비교 날짜
   * @returns
   */
  public getDateDiff(a: Date | string, b: Date | string): number {
    const dateA = new Date(a);
    const dateB = new Date(b);

    const timeA = dateA.getTime();
    const timeB = dateB.getTime();

    return Number((timeA - timeB) / 86400 / 1000);
  }

  /**
   * 날짜를 타임스탬프로 반환
   * - 인자를 확인해서 YYYY-MM-DD hh:mm:ss 형식으로 맞춰주고 타임스탬프로 반환.
   * 이때, 날짜 형식이 맞지 않으면 0으로 반환.
   * @param date 타임스탬프로 변환할 날짜
   * @returns
   */
  public getTimestamp = (date: string) => {
    if (date.length < 19) {
      date = date + ' 00:00:00';
    }
    const timeStamp = new Date(date).getTime();

    return !Number.isNaN(timeStamp) ? timeStamp : 0;
  };

  /**
   * auth token decode
   * @param token
   * @returns
   */
  public decodeJWT(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(payload);
  }

  /**
   * 검색 시작일과 종료일을 time으로 변환하여 반환
   * @param s 검색 시작일
   * @param e 검색 종료일
   * @returns
   */
  public betweenTime(s: string, e: string): number[] {
    const startTime = new Date(s).getTime() / 1000;
    const endTime = new Date(e).getTime() / 1000;
    return [startTime, endTime];
  }

  /**
   * 사이트 기본 정보 설정 (상수, 광고주 등등)
   */
  public async setDefaultData(): Promise<void> {
    const sessionStore = useSessionStore();
    const clientStore = useClientStore();
    const memberApi = useMemberAccountApi();

    memberApi
      .getMembersClients({ join: 1 })
      .then(({ code, results }) => {
        if (code === getMembersClientsMsg.MEMBER_CLIENT_LIST_GET_SUCCESS) {
          clientStore.setClientList(results.clients);

          const { getClientId } = storeToRefs(sessionStore);
          clientStore.setClientAccountByClientId(getClientId.value);
        }
      });
  }

  /**
   * 로그인
   * @param memberEmail
   * @param password
   * @returns
   */
  public async login(memberEmail: string, password: string): Promise<boolean> {
    const sessionStore = useSessionStore();
    const membersApi = useMemberAccountApi();

    const { code } = await membersApi.postMembersLogin({ memberEmail, password });

    if (code === postMembersLoginMsg.LOGIN_SUCCESS) {
      let token = membersApi.getAuthToken();

      sessionStore.setAuthToken(token);


      // 로그인 후 선택된 광고주 정보가 없기 때문에 기존 사용 내역을 확인 후 (localStorage) 처리
      const  { VUE_APP_LOCAL_STORAGE_CLIENT_KEY } = process.env;
      const clientId: string | null = localStorage.getItem(VUE_APP_LOCAL_STORAGE_CLIENT_KEY);

      if (clientId) {
        const response = await membersApi.patchMembersClients(clientId);

        if (response.code === patchMembersClientsMsg.CLIENT_ACCOUNT_SELECTED_SUCCESS) {
          token = membersApi.getAuthToken();
          sessionStore.setAuthToken(token);
        }
      }

      // 기타 사이트 사용에 필요한 데이터 세팅
      // 김종윤(2024.03.15): Gnb 광고주 선택 목록을 표시할 때 API 호출하기 때문에 불필요
      // await this.setDefaultData();

      return true;
    }

    return false;
  }

  public axiosErrorCatch<T extends { code: string }>(err: any): void {
    if (axios.isAxiosError<T, any>(err)) {
      const { response } = err;

      if (response) {
        const { code } = response.data;
        const message = getApiErrorMessage(code);

        if (message) {
          this.Toast({ color: 'warning', message });
        } else {
          this.Toast({ color: 'danger', message: 'Error : 고객센터에 문의를 남겨주세요.' });
        }
      }
    } else {
      console.log(err);
    }
  }

  /**
   * 서버의 boolean 형식 변환하여 리턴
   * @param bool 변환할 값
   * @returns
   */
  public getBoolean(bool: boolean | string): number {
    if (bool) {
      return booleanYN.Y;
    } else {
      return booleanYN.N;
    }
  }

  /**
   * 엑셀 열 순서 세팅
   * @param index
   */
  public getExcelColumn = (index: number): string => {
    const arr: string[] = Array.from({ length: 26 }, (_, i: number) => String.fromCharCode(i + 65));

    if (index >= 26) {
      const first: number = Math.floor(index / 26) - 1;
      const second: number = index % 26;

      return `${arr[first]}${arr[second]}`;

    } else {
      return arr[index];
    }
  };
}

export const useUtil = () => {
  return new util();
};