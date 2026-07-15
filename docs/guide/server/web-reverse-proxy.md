---
title: web.poppang.co.kr을 Nginx 리버스 프록시로 연결하기
description: Ubuntu 또는 Debian 서버에서 web.poppang.co.kr 요청을 Nginx와 Let's Encrypt 인증서로 127.0.0.1:3100 앱에 안전하게 연결하는 방법
---

# web.poppang.co.kr을 Nginx 리버스 프록시로 연결하기

이 문서에서는 `web.poppang.co.kr` 요청을 서버의 `127.0.0.1:3100` 앱으로 전달하는 Nginx 리버스 프록시를 설정해요. 기존 `poppang.co.kr` 설정은 건드리지 않고, `web.poppang.co.kr` 전용 설정 파일을 따로 만들어요.

문서를 마치면 아래 흐름이 동작해요.

```text
브라우저 → DNS → Nginx :80 → HTTPS로 이동 → Nginx :443 → 127.0.0.1:3100 앱
```

## 먼저 알아둘 개념

| 용어             | 의미                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DNS A 레코드     | 도메인 이름을 서버 IP 주소에 연결하는 DNS 레코드예요. `web` A 레코드가 `183.103.19.203`을 가리키고, 이 IP가 실제 Nginx 서버라면 DNS를 더 바꿀 필요가 없어요. |
| Nginx            | 외부 HTTP·HTTPS 요청을 받고, 정적 파일을 제공하거나 내부 앱으로 요청을 전달하는 웹 서버예요.                                                                 |
| 리버스 프록시    | 클라이언트 대신 내부 앱에 요청을 전달하고, 앱의 응답을 다시 클라이언트에 돌려주는 서버 구성이에요. 이 문서에서는 Nginx가 그 역할을 해요.                     |
| `127.0.0.1:3100` | 서버 자신만 접근할 수 있는 loopback 주소의 3100 포트예요. 외부에서는 Nginx만 공개하고 앱 포트는 서버 내부에서만 사용해요.                                    |
| `server` 블록    | Nginx에서 특정 포트와 `server_name`으로 들어온 요청을 처리하는 설정 단위예요. 같은 IP를 쓰더라도 `poppang.co.kr`과 `web.poppang.co.kr`을 분리할 수 있어요.   |
| TLS 인증서       | HTTPS 통신을 암호화하고 도메인 소유를 검증하는 인증서예요. 이 문서에서는 Let's Encrypt 인증서를 사용해요.                                                    |
| Certbot          | Let's Encrypt 인증서를 발급하고 Nginx 설정에 연결하는 도구예요.                                                                                              |

## `/etc/nginx/sites-available`과 `sites-enabled`

Ubuntu와 Debian 계열 Nginx 패키지는 보통 사이트 설정을 두 디렉터리로 나눠 관리해요.

| 경로                         | 역할                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/etc/nginx/sites-available` | 만들 수 있는 사이트 설정 파일을 보관해요. 파일을 이곳에 만들기만 해서는 Nginx가 사용하지 않아요.                          |
| `/etc/nginx/sites-enabled`   | 실제로 Nginx가 읽을 사이트 설정을 심볼릭 링크로 연결해요. `sites-available`의 파일을 이곳에 링크하면 사이트가 활성화돼요. |

아래 명령으로 현재 설정과 활성화 상태를 확인해요.

```bash
sudo ls -al /etc/nginx/sites-available
sudo ls -al /etc/nginx/sites-enabled
```

`sites-enabled`에 보이는 `web.poppang.co.kr -> /etc/nginx/sites-available/web.poppang.co.kr` 같은 항목은 심볼릭 링크예요. Nginx의 실제 include 경로가 궁금하면 아래 명령으로 확인할 수 있어요.

```bash
sudo nginx -T | grep -n "sites-enabled"
```

## 준비할 것

- `web.poppang.co.kr`의 A 레코드가 Nginx 서버 IP를 가리켜요.
- 서버에 SSH로 접속할 수 있고 `sudo` 권한이 있어요.
- Nginx가 설치되어 실행 중이에요.
- `127.0.0.1:3100`에서 앱이 실행 중이에요.
- 서버 방화벽과 클라우드 보안 그룹에서 TCP 80, 443 포트가 열려 있어요.

`certbot --nginx`는 공개 인터넷에서 접근 가능한 HTTP 사이트와 80 포트가 필요해요. 인증서를 발급하기 전에 먼저 HTTP 프록시를 적용하는 이유예요. [Certbot의 Nginx 안내](https://certbot.eff.org/instructions?os=snap&ws=nginx)도 같은 전제 조건을 설명해요.

## 1. 서버에 접속하기

로컬 터미널에서 서버에 접속해요. 사용자 이름은 서버 계정으로 바꾸세요.

```bash
ssh <사용자명>@183.103.19.203
```

IP가 바뀌었거나 다른 서버를 사용한다면 실제 Nginx 서버의 IP를 사용하세요.

## 2. 3100 포트의 앱 확인하기

Nginx를 설정하기 전에 앱이 서버 내부에서 응답하는지 먼저 확인해요.

```bash
curl -i http://127.0.0.1:3100
```

`200`, `301` 또는 HTML 응답이 오면 앱이 응답 중이에요. `Connection refused`가 나오면 Nginx 문제가 아니라 앱이 실행 중이지 않거나 3100 포트에서 수신하지 않는 문제예요.

포트를 점유한 프로세스도 확인해요.

```bash
sudo ss -lntp | grep ':3100'
```

이 명령의 결과가 없으면 앱 실행 방식과 포트 설정부터 점검하세요.

## 3. 기존 Nginx 사이트 설정 확인하기

기존 `poppang.co.kr` 관련 파일을 수정하지 마세요. `web.poppang.co.kr` 전용 파일을 새로 만들면 두 사이트를 독립적으로 배포하고 되돌릴 수 있어요.

```bash
sudo ls -al /etc/nginx/sites-available
sudo ls -al /etc/nginx/sites-enabled
```

이미 `web.poppang.co.kr` 파일이나 링크가 있다면 내용을 먼저 확인하세요. 같은 파일을 다시 만들거나 같은 링크를 다시 만들면 명령이 실패할 수 있어요.

```bash
sudo ls -l /etc/nginx/sites-available/web.poppang.co.kr
sudo ls -l /etc/nginx/sites-enabled/web.poppang.co.kr
```

## 4. 먼저 HTTP 리버스 프록시 설정 만들기

인증서가 아직 없을 수 있으므로, 처음에는 SSL 설정을 넣지 않고 HTTP 프록시부터 적용해요. 이렇게 해야 Certbot이 HTTP-01 검증을 수행할 수 있어요.

```bash
sudo nano /etc/nginx/sites-available/web.poppang.co.kr
```

아래 설정을 붙여 넣으세요.

```nginx
server {
    listen 80;
    server_name web.poppang.co.kr;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        proxy_buffering off;
    }
}
```

`nano`에서 `Ctrl + O`를 누르고 Enter를 눌러 저장한 뒤, `Ctrl + X`로 종료해요.

### 프록시 설정이 하는 일

| 설정                                    | 역할                                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `proxy_pass http://127.0.0.1:3100;`     | 받은 요청을 서버 내부의 3100 포트 앱으로 전달해요. URI를 추가하지 않았으므로 요청 경로를 유지해 전달해요. |
| `proxy_http_version 1.1;`               | upstream 앱과 HTTP/1.1로 통신해요.                                                                        |
| `Host $host`                            | 앱이 사용자가 요청한 호스트 이름을 알 수 있게 해요.                                                       |
| `X-Real-IP`, `X-Forwarded-For`          | 앱과 로그가 원래 클라이언트 IP를 확인할 수 있게 해요.                                                     |
| `X-Forwarded-Proto`, `X-Forwarded-Host` | 앱이 원래 요청의 `http`·`https` 프로토콜과 호스트를 알 수 있게 해요.                                      |
| `proxy_buffering off;`                  | upstream 응답을 Nginx가 버퍼링하지 않게 해요. 팀에서 전달한 설정을 그대로 유지해요.                       |

Nginx의 `proxy_pass`는 요청을 다른 서버로 전달하고, `proxy_set_header`는 upstream에 전달할 헤더를 바꿔요. `$host`와 `$proxy_add_x_forwarded_for`의 동작은 [Nginx 프록시 모듈 문서](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)에서 확인할 수 있어요.

## 5. 설정 활성화하고 Nginx에 반영하기

`sites-available`의 파일을 `sites-enabled`에 심볼릭 링크로 연결해요. 이 명령은 링크가 없을 때 한 번만 실행하세요.

```bash
sudo ln -s /etc/nginx/sites-available/web.poppang.co.kr /etc/nginx/sites-enabled/web.poppang.co.kr
```

설정을 반영하기 전에 문법을 검사하세요.

```bash
sudo nginx -t
```

`syntax is ok`와 `test is successful`가 나오면 Nginx를 다시 시작하지 않고 설정만 다시 읽게 해요.

```bash
sudo systemctl reload nginx
```

이 시점에 HTTP로 연결되는지 확인해요.

```bash
curl -I http://web.poppang.co.kr
```

브라우저에서 `http://web.poppang.co.kr`을 열어도 돼요. 아직 인증서를 발급하지 않았으므로 HTTP 응답이 오면 정상이에요.

## 6. HTTPS 인증서 발급하기

팀에서 Ubuntu 또는 Debian의 APT 패키지로 Certbot을 관리한다면 아래 명령으로 Nginx 플러그인을 설치해요.

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

그다음 인증서를 발급하고 Nginx에 설치해요.

```bash
sudo certbot --nginx -d web.poppang.co.kr
```

이메일을 입력하고 약관에 동의하세요. HTTP 요청을 HTTPS로 리디렉션할지 묻는다면 리디렉션 옵션을 선택하세요. Certbot은 인증서 발급과 Nginx 설정 변경을 함께 처리할 수 있어요.

인증서 발급이 실패하면 아래를 먼저 확인하세요.

- `web.poppang.co.kr`이 실제 Nginx 서버 IP를 가리키는지
- 외부 인터넷에서 80 포트에 접근할 수 있는지
- 4단계의 HTTP 프록시가 `nginx -t`를 통과하고 `reload`되었는지

## 7. 최종 Nginx 설정 확인하기

Certbot은 기존 서버 블록을 인식해 TLS 설정을 추가할 수 있어요. 그래서 인증서 발급 전의 간단한 HTTP 설정과 최종 설정은 조금 달라질 수 있어요.

현재 `web.poppang.co.kr` 서버에서 사용하는 최종 설정은 아래예요. Certbot이 관리한다고 표시한 줄도 함께 유지하세요. 짧은 예시로 바꾸면 Certbot의 TLS 권장 설정이 빠질 수 있어요.

```bash
sudo nano /etc/nginx/sites-available/web.poppang.co.kr
```

인증서가 발급된 _뒤에만_ 아래 설정을 사용하세요. 아직 인증서가 없다면 `ssl_certificate` 경로가 존재하지 않아 `nginx -t`가 실패해요.

```nginx
# ============================================================
# web.poppang.co.kr HTTPS 서버
# 외부 HTTPS 요청을 내부 앱 서버(127.0.0.1:3100)로 전달한다.
# ============================================================
server {
    server_name web.poppang.co.kr;

    # 모든 요청을 로컬의 웹 애플리케이션으로 reverse proxy
    location / {
        proxy_pass http://127.0.0.1:3100;

        # WebSocket / keep-alive 등의 HTTP/1.1 연결을 유지
        proxy_http_version 1.1;

        # 앱 서버가 원래 요청의 도메인·IP·프로토콜을 알 수 있게 전달
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        # 스트리밍 응답 등이 즉시 전달되도록 Nginx 버퍼링 비활성화
        proxy_buffering off;
    }

    # HTTPS(443) 수신 및 Let's Encrypt 인증서 설정
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/web.poppang.co.kr/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/web.poppang.co.kr/privkey.pem; # managed by Certbot

    # Certbot이 제공하는 권장 TLS 보안 옵션
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# ============================================================
# HTTP(80) 요청 처리
# web.poppang.co.kr로 들어온 HTTP 요청을 HTTPS로 영구 이동한다.
# ============================================================
server {
    # 이 도메인으로 들어온 요청만 HTTPS로 301 리디렉션
    if ($host = web.poppang.co.kr) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name web.poppang.co.kr;

    # 일치하지 않는 Host 요청은 응답하지 않음
    return 404; # managed by Certbot
}
```

| 설정                                              | 역할                                                                                                            |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `include /etc/letsencrypt/options-ssl-nginx.conf` | Certbot이 제공하는 TLS 프로토콜과 암호화 관련 권장 설정을 불러와요.                                             |
| `ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem`   | Certbot이 만든 Diffie-Hellman 파라미터를 TLS 설정에 사용해요.                                                   |
| `if ($host = web.poppang.co.kr)`                  | 요청 `Host`가 정확히 `web.poppang.co.kr`일 때만 같은 경로와 쿼리 문자열을 유지한 채 HTTPS로 `301` 리디렉션해요. |
| `return 404`                                      | 이 HTTP 서버 블록에 들어왔지만 도메인이 일치하지 않는 요청에는 `404`를 반환해요.                                |

HTTPS용 `server` 블록만 `127.0.0.1:3100`으로 프록시해요. `# managed by Certbot`이라고 표시된 줄은 Certbot이 추가하거나 관리한 부분이므로, 인증서를 다시 발급하거나 설정을 수정할 때 지우지 마세요.

## 8. 최종 반영과 확인

설정을 수정한 뒤에는 항상 문법 검사부터 실행하세요.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

마지막으로 HTTP와 HTTPS를 각각 확인해요.

```bash
curl -I http://web.poppang.co.kr
curl -I https://web.poppang.co.kr
```

| 요청                            | 기대 결과                                                               |
| ------------------------------- | ----------------------------------------------------------------------- |
| `http://web.poppang.co.kr`      | `301` 응답과 함께 같은 경로의 `https://web.poppang.co.kr`으로 이동해요. |
| `https://web.poppang.co.kr`     | 앱의 응답인 `200`, `301` 등을 반환해요.                                 |
| `curl -i http://127.0.0.1:3100` | Nginx를 거치지 않고 앱이 직접 응답해요.                                 |

## 자주 막히는 문제

### `curl http://127.0.0.1:3100`이 연결을 거부해요

앱이 실행 중이지 않거나 다른 포트에서 수신 중이에요. `sudo ss -lntp | grep ':3100'`으로 실제 수신 포트와 프로세스를 확인하세요. 앱을 먼저 정상 실행한 뒤 Nginx를 다시 확인하세요.

### `sudo nginx -t`가 실패해요

오류 메시지에 나온 파일과 줄 번호를 확인하세요. `ssl_certificate` 경로가 없으면 인증서를 발급하기 전 SSL 설정을 적용한 경우예요. 일단 4단계의 HTTP 설정으로 되돌린 뒤 Certbot을 실행하세요.

### Certbot이 도메인을 검증하지 못해요

DNS가 다른 IP를 가리키거나 80 포트가 방화벽·보안 그룹에서 막혀 있을 가능성이 높아요. `curl -I http://web.poppang.co.kr`이 외부 환경에서도 응답하는지 확인하세요.

### 기존 `poppang.co.kr`이 영향을 받아요

기존 설정 파일을 수정하지 않았는지, 새 `server` 블록의 `server_name`이 정확히 `web.poppang.co.kr`인지 확인하세요. 사이트별 설정 파일과 심볼릭 링크를 분리하면 기존 도메인을 독립적으로 유지할 수 있어요.

## 운영할 때 지킬 것

- 기존 `poppang.co.kr` 설정 파일은 수정하지 않아요.
- 인증서가 발급되기 전에는 SSL 설정을 적용하지 않아요.
- `nginx -t`가 성공하기 전에는 `reload`하지 않아요.
- 3100 포트는 외부 공개가 아니라 Nginx가 접근하는 내부 앱 포트로 유지해요.
- 도메인 설정을 바꾸기 전에는 `sites-available`과 `sites-enabled`를 모두 확인해요.
