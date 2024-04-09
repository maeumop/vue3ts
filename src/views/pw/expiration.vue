<template>
  <div id="pageExpiration" class="content">
    <h1>
      <a href="/" class="logo"></a>
    </h1>

    <div class="findPwInfo">
      <span>
        인증 기간 만료 또는<br />
        만료 처리된 인증 메일입니다.
      </span>
      <p>
        본 이메일은 인증 기간이 만료되었거나 이미 만료 처리된 인증 이메일입니다. 새로운 인증 이메일을 통해 비밀번호 변경을 시도해 주세요. 감사합니다.
      </p>
    </div>

    <div class="width-350">
      <div class="buttonBox">
        <StyledButton
          block
          color="primary"
          href="/findPw"
          target="_self"
        >
          비밀번호 찾기 바로가기
        </StyledButton>
        <StyledButton
          block
          outline
          href="/"
          target="_self"
        >
          로그인 바로가기
        </StyledButton>
      </div>
    </div>

    <div class="copyright">
      <span>© <strong>dreaminsight</strong> All Rights Reserved.</span>
    </div>
  </div>
</template>
