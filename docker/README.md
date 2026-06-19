# Docker 실행 가이드

Vite + Vue 3 SPA를 빌드해 nginx로 서빙합니다.
호스트(서버)의 **28080** 포트가 컨테이너의 80 포트로 연결됩니다.

## 구성 파일

- `Dockerfile` — Node로 빌드 후 nginx로 정적 파일 서빙 (멀티스테이지)
- `nginx.conf` — SPA 라우팅 폴백 + 정적 에셋 캐싱
- `docker-compose.yml` — 빌드/실행 정의 (28080 → 80 매핑)

## 실행 방법 (docker compose 권장)

`docker/` 폴더에서 실행합니다.

```bash
cd docker

# API 주소를 배포 환경에 맞게 지정 (선택). Vite 환경변수는 빌드 시점에 인라인됩니다.
export VITE_API_BASE_URL=https://api.example.com

# 빌드 + 백그라운드 실행
docker compose up -d --build
```

접속: `http://<서버주소>:28080`

### 상태 확인 / 로그 / 종료

```bash
docker compose ps
docker compose logs -f
docker compose down
```

## 실행 방법 (docker 단독 명령)

compose 없이 직접 실행할 경우, **빌드 컨텍스트는 프로젝트 루트**여야 합니다.

```bash
# 프로젝트 루트에서 실행
docker build \
  -f docker/Dockerfile \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  -t gaon-climate-web:latest .

docker run -d \
  --name gaon-climate-web \
  -p 28080:80 \
  --restart unless-stopped \
  gaon-climate-web:latest
```

## 참고

- `VITE_API_BASE_URL`은 **빌드 시점**에 정적 파일에 인라인됩니다. 값을 바꾸면 이미지를 다시 빌드해야 합니다.
- 코드를 수정한 뒤에는 `--build` 옵션으로 다시 빌드하세요.
- 28080 포트가 서버 방화벽/보안그룹에서 열려 있는지 확인하세요.
