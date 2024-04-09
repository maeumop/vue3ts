export interface ReplaceCode {
  name: string
  code: string
  desc: string
}

export const inputCodeItem: ReplaceCode = {
  name: '기타1 ~ 20',
  code: '{#=input1} ~ {#=input20}',
  desc: 'DB 필드 데이터 전송',
};

export const inputCodeList: ReplaceCode[] = new Array(20).fill(0).map((_, i) => {
  return {
    name: `기타${i + 1}`,
    code: `{#=input${i + 1}}`,
    desc: 'DB 필드 데이터 전송',
  };
});

export const replaceCodeList: ReplaceCode[] = [
  {
    name: '이름',
    code: '{#=name}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '연락처',
    code: '{#=phone}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '연락처(첫자리)',
    code: '{#=phone1}',
    desc: '연락처 앞 3글자',
  },
  {
    name: '연락처(중간자리)',
    code: '{#=phone2}',
    desc: '연락처 4~6 자리',
  },
  {
    name: '연락처(끝자리)',
    code: '{#=phone3}',
    desc: '연락처 8~11 자리',
  },
  {
    name: '나이',
    code: '{#=age}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '성별',
    code: '{#=gender}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '성별(함수형)',
    code: '{#=gender(M=남자,F=여자)}',
    desc: '성별 M = ‘남’, F = ‘여’ 매핑 후 전송',
  },
  {
    name: 'SMS 수신 여부',
    code: '{#=smsYn}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: 'SMS 수신 여부(함수형',
    code: '{#=smsYn(TRUE=Y,FALSE=N)}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: 'SMS 수신 동의/거부일',
    code: '{#=smsYnDate}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '제 3자 제공 동의 여부',
    code: '{#=thirdPartyYn}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '제 3자 제공 동의 여부(함수형)',
    code: '{#=thirdPartyYn(TRUE=Y,FALSE=N)}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '제 3자 제공 동의/거부일',
    code: '{#=thirdPartyYnDate}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '개인정보 수집 및 이용 동의',
    code: '{#=privacyYn}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '함수형',
    code: '{#=privacyYn(TRUE=Y,FALSE=N)}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '아이피',
    code: '{#=ip}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '유입링크',
    code: '{#=referer}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '접수일(DATETIME)',
    code: '{#=regDatetime}',
    desc: '‘YYYY-MM-DD HH:MM:SS’ 형식으로 전송',
  },
  {
    name: '접수일(DATE)',
    code: '{#=regDate}',
    desc: '‘YYYY-MM-DD’ 형식으로 전송',
  },
  {
    name: '매체 코드',
    code: '{#=mediaCode}',
    desc: 'DB 필드 데이터 전송',
  },
  {
    name: '매체 코드',
    code: '{#=etcComment}',
    desc: 'DB 필드 데이터 전송',
  },
];
