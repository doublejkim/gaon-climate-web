# Docker 실행 가이드

Vite + Vue 3 SPA를 빌드해 nginx로 서빙합니다.
호스트(서버)의 **28080** 포트가 컨테이너의 80 포트로 연결됩니다.

## 구성 파일

- `Dockerfile` — Node로 빌드 후 nginx로 정적 파일 서빙 (멀티스테이지)
- `nginx.conf` — SPA 라우팅 폴백 + 정적 에셋 캐싱
- `docker-compose.yml` — 빌드/실행 정의 (28080 → 80 매핑)

## 실행 방법 (docker compose 권장)

`docker/` 폴더에서 실행합니다.

### 1. `.env` 파일 준비 (권장)

compose 는 같은 디렉토리의 `.env` 를 자동으로 읽어 빌드 인자로 치환합니다.

```bash
cd docker
cp .env.example .env
# .env 를 열어 VITE_API_BASE_URL 을 배포 환경 주소로 수정
```

> `docker/.env` 는 git 에 커밋되지 않습니다(`.gitignore` 처리됨). 환경별 값은 서버에서 직접 관리하세요.
> Vite 환경변수는 빌드 시점에 정적 파일로 인라인됩니다.

### 2. 빌드 + 실행

```bash
docker compose up -d --build
```

`.env` 없이 한 번만 직접 지정하려면 환경변수로도 가능합니다.

```bash
VITE_API_BASE_URL=https://api.example.com docker compose up -d --build
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
