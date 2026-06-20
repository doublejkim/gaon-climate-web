# 1. 프로그램 개요 

## 1.1. 프로젝트 설명  

- gaon-climate-core 서버가 제공하는 REST API 를 사용하는 반응형 웹 프로젝트

## 1.2. 기술 스택

- Vue3
- TypeScript
- PrimeVue 참고 (https://primevue.org)
  - 참고 Theme : https://github.com/primefaces/sakai-vue
  - sakai-vue sample : https://primevue.org/templates/sakai/
- Pinia
- Vue Router
- Chart.js

## 1.3. 참고 서버 프로젝트

- 경로 : `../gaon-climate-core`

# 2. 서비스 요구사항

## 2.1. 회원가입

- gaon-climate-core 서버가 제공하는 회원가입 API 를 통해 회원가입 수행
- API : `POST /users/sign-up`

## 2.2. 로그인

- gaon-climate-core 서버가 제공하는 로그인 API 를 통해 로그인 수행
- 로그인이 정상적으로 완료되면 (토큰을 정상적으로 받았다면) 디바이스 목록 조회가 되어 보임
- 정상적으로 로그인이 완료되면 액세스토큰과 리프레시토큰을 받음. 액세스토큰으로 모든 api 조회시 사용하되 401 응답을 받을 경우 리프레시토큰으로 다시 액세스토큰을 획득하는 작업을 수행하고 새로받은 액세스토큰으로 액션을 다시 수행하도록함
- 디바이스 목록조회시 디바이스가없다면 등록된 디바이스가 없습니다. 라는 메시지가 보이게함
- 디바이스 목록은 스크롤해서 볼수있는 형태임
- 화면 한 쪽에는 디바이스 등록 버튼 표시
- API : `POST /users/login`

## 2.3. 디바이스 조회

- gaon-climate-core 서버가 제공하는 디바이스 조회 API 를 통해 디바이스 조회
- API : `GET /users/me/devices`

## 3.4. 특정 디바이스의 온도 조회

- gaon-climate-core 서버가 제공하는 디바이스 온도 조회 API 호출
- API : `GET /users/me/devices/{deviceId}/latest-measurement`
