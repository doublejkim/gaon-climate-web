# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:22-alpine AS build

WORKDIR /app

# 빌드 시점에 주입되는 Vite 환경변수 (정적 빌드에 인라인됨)
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 의존성 캐시 최적화: lock 파일 먼저 복사 후 설치
# 주: lock 파일이 플랫폼별 optional 의존성으로 동기화되지 않을 수 있어
#     엄격한 `npm ci` 대신 `npm install`을 사용합니다.
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

# 소스 복사 후 빌드
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine AS runtime

# SPA 라우팅용 nginx 설정
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물(dist) 정적 파일 배포
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# localhost는 ::1(IPv6)로 먼저 해석될 수 있으나 nginx는 IPv4(listen 80)만 듣는다.
# IPv6 거부로 헬스체크가 실패하지 않도록 127.0.0.1로 고정한다.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
