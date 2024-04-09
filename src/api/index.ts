import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { useSessionStore } from '@/store';
import { useRouter } from 'vue-router';

export class api {
  private http: AxiosInstance;
  private auth: boolean = true;
  private authToken: string = '';
  private isProgressing: boolean = false;
  private router = useRouter();

  constructor() {
    this.http = axios.create({
      baseURL: process.env.VUE_APP_API_URL,
      timeout: 60000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  public noAuth(): this {
    this.auth = false;
    return this;
  }

  /**
   * token 변수에 저장된 내용을 반환
   * @returns API Authorization Token
   */
  public getAuthToken = (): string => this.authToken;

  /**
   * api 요청 상태
   * @returns true 요청중, false 요청완료 또는 미요청
   */
  public getProgressStatus = (): boolean => this.isProgressing;

  private interceptors(): void {
    this.isProgressing = true;

    if (!this.auth) {
      this.isProgressing = false;
      return;
    }

    const sessionStore = useSessionStore();

    if (sessionStore.getLoginStatus) {
      this.http.interceptors.request.use(
        (config) => {
          // authorization token 삽입
          config.headers.Authorization = `Bearer ${sessionStore.getAuthToken}`;
          return config;
        },
        (error) => Promise.reject(error),
      );
    }

    this.http.interceptors.response.use(
      (config) => {
        // progress 상태를 종료 상태로 변경
        this.isProgressing = false;
        return config;
      },
      (error) => {
        const { code } = error;

        if (code === 'ERR_NETWORK') {
          localStorage.setItem('unauthorized', '1');
          this.router.push('/');
        }

        return Promise.reject(error);
      }
    );
  }

  // 데이터 호출 API
  public httpGet(url: string, params?: any): Promise<any> {
    this.interceptors();

    return this.http.get(url, { params }).then((res) => res.data);
  }

  // 데이터 전송 API
  public httpPost(url: string, json?: any, headers = {}): Promise<any> {
    this.interceptors();

    return this.http.post(url, json, { headers })
      .then(res => {
        // post 요청중 응답 header에 x-amzn-remapped-authorization(auth token) 프로퍼티가 있는 경우 변수에 저장
        if ('x-amzn-remapped-authorization' in res.headers) {
          this.authToken = res.headers['x-amzn-remapped-authorization'].replace('Bearer ', '');
        }

        return res.data;
      });
  }

  public httpPut(url: string, json?: any, headers = {}): Promise<any> {
    this.interceptors();

    return this.http.put(url, json, { headers }).then(res => res.data);
  }

  public httpPatch(url: string, json?: any, headers = {}): Promise<any> {
    this.interceptors();

    return this.http.patch(url, json, { headers })
      .then(res => {
        // post 요청중 응답 header에 x-amzn-remapped-authorization(auth token) 프로퍼티가 있는 경우 변수에 저장
        if ('x-amzn-remapped-authorization' in res.headers) {
          this.authToken = res.headers['x-amzn-remapped-authorization'].replace('Bearer ', '');
        }

        return res.data;
      });
  }

  public httpDelete(url: string, json?: any): Promise<any> {
    this.interceptors();

    return this.http.delete(url, { data: json }).then(res => res.data);
  }

  /*/ 오류 확인  사용안함
  private responseError(error: any, url: string): void {
    console.error('error url: ', url);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('response data: ', error.response.data);
      console.error('response status: ', error.response.status);
      console.error('response header: ', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error('request error: ', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('etc error:', error.message);
    }

    console.error('axios config:', error.config);
  } */
}
