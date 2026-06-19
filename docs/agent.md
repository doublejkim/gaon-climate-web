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
- API : `POST /users/login`

## 2.3. 디바이스 조회

- gaon-climate-core 서버가 제공하는 디바이스 조회 API 를 통해 디바이스 조회
- API : `GET /users/me/devices`

## 3.4. 특정 디바이스의 온도 조회

- gaon-climate-core 서버가 제공하는 디바이스 온도 조회 API 호출
- API : `GET /users/me/devices/{deviceId}/latest-measurement`
