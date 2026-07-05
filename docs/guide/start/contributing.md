---
title: 문서 기여하기
description: 팝팡 팀원이 이 저장소의 문서를 수정하고 새 페이지를 만들고 검증한 뒤 현재 브랜치에 푸시하는 방법
---

# 문서 기여하기

이 문서는 팝팡 팀원이 개발 문서를 갱신할 때 보는 작업 가이드예요. 저장소를 최신 상태로 가져오고, 문서를 어디에 써야 할지 정하고, 스킬로 초안을 만들거나 직접 다듬은 뒤, 검증하고 푸시하는 흐름만 정리했어요.

문서를 다 읽으면 아래 작업을 할 수 있어요.

- 이 저장소를 로컬에 받아서 문서 사이트를 실행해요
- 기존 문서를 수정하거나 새 문서를 추가해요
- `poppang-technical-writing` 스킬로 초안을 만들거나 문장을 다듬어요
- 새 페이지를 만들 때 `_meta.json`, `title`, `description`까지 같이 맞춰요
- 검증한 뒤 현재 작업 브랜치에 커밋하고 푸시해요

## 시작 전에 준비할 것

- Git
- Node.js와 npm
- Codex에서 사용할 수 있는 `poppang-technical-writing` 스킬
- 기존 문서 설명을 따로 정리할 때 쓸 수 있는 `rspress-description-generator` 스킬

## 1. 저장소 최신 상태 가져오기

처음 작업한다면 팀 저장소를 clone하세요.

```bash
git clone <repository-url>
cd PopPang-Docs
npm install
```

이미 저장소가 있다면 작업 전에 최신 변경을 먼저 받아오세요.

```bash
git pull
```

의존성이 바뀌었을 수 있으니 `package.json`이 달라졌다면 다시 설치하세요.

```bash
npm install
```

## 2. 로컬에서 문서 사이트 실행하기

개발 서버를 띄우고 바뀐 내용을 바로 확인하세요.

```bash
npm run dev
```

터미널에 표시된 로컬 주소를 브라우저에서 열면 문서를 바로 볼 수 있어요.

작업을 마치기 전에 아래 명령으로 기본 검증도 꼭 해주세요.

```bash
npm run lint
npm run build
```

## 3. 문서를 어디에 써야 하는지 정하기

이 저장소의 문서는 `docs/` 아래에 모여 있어요.

- `docs/guide/start/`: 팀 소개, 문서 사용법, 기여 가이드처럼 공통 시작 문서
- `docs/guide/flutter/`: Flutter 관련 가이드
- `docs/guide/use-mdx/`: MDX나 Rspress 작성법
- `docs/api/`: 명령어, 규칙, API 성격의 문서

문서 하나에는 목표 하나만 두는 편이 좋아요. 설치 가이드, 개념 설명, 오류 해결, API 정리를 한 페이지에 모두 섞지 마세요.

## 좌측 목차가 어떻게 만들어지는지 이해하기

처음 보면 `_meta.json`, `title`, `description`이 각각 어디에 쓰이는지 헷갈릴 수 있어요. 이 저장소에서는 이 값들이 서로 연결돼서 화면에 보여요.

먼저 큰 구조는 이렇게 나뉘어요.

- `docs/_nav.json`: 상단 네비게이션을 정해요
- `docs/guide/_meta.json`: 좌측 사이드바의 큰 섹션 이름을 정해요
- `docs/guide/start/_meta.json` 같은 섹션별 `_meta.json`: 그 섹션 안에서 페이지 순서를 정해요
- 각 문서 파일의 `title`: 좌측 사이드바에 보이는 페이지 이름이 돼요
- 각 문서 파일의 `description`: 페이지 설명용 메타데이터예요. 좌측 사이드바 이름을 정하지는 않아요

지금 `Getting Started` 섹션은 실제로 아래처럼 연결돼 있어요.

```text
docs/guide/_meta.json
  -> Getting Started 섹션 헤더

docs/guide/start/_meta.json
  -> introduction, contributing 순서

docs/guide/start/introduction.md
  -> title: 팝팡 개발자 가이드 소개

docs/guide/start/contributing.md
  -> title: 문서 기여하기
```

이 구조가 좌측 사이드바에서는 이렇게 보여요.

```text
Getting Started
  - 팝팡 개발자 가이드 소개
  - 문서 기여하기
```

핵심은 두 가지예요.

- `_meta.json`은 순서와 묶음을 정해요
- `title`은 실제로 사용자에게 보이는 문서 이름을 정해요

예를 들어 `docs/guide/start/_meta.json`이 아래처럼 되어 있으면:

```json
["introduction", "contributing"]
```

`introduction.md`, `contributing.md`가 그 순서대로 좌측 사이드바에 보여요. 여기서 각 항목에 실제로 보이는 이름은 파일명 자체가 아니라 각 문서의 `title`이에요.

```md
---
title: 문서 기여하기
description: 팝팡 팀원이 이 저장소의 문서를 수정하고 새 페이지를 만들고 검증한 뒤 현재 브랜치에 푸시하는 방법
---
```

여기서:

- `title`은 좌측 사이드바 이름과 페이지 제목에 써요
- `description`은 문서 설명에 써요
- `contributing` 같은 slug는 `_meta.json`과 파일명을 연결해요

상단의 `시작하기`, `튜토리얼`, `API` 메뉴는 좌측 사이드바가 아니라 `docs/_nav.json`에서 따로 관리해요. 그래서 좌측 목차를 바꿀 때와 상단 메뉴를 바꿀 때 수정하는 파일이 달라요.

## 4. 어떤 스킬을 쓰면 좋은가요

문서 작업의 기본 스킬은 `poppang-technical-writing`이에요.

이 스킬은 아래 상황에서 바로 쓰면 돼요.

- 기존 초안을 더 또렷하게 다듬고 싶을 때
- 추천 문서 유형부터 정하고 싶을 때
- 목차와 흐름을 다시 잡고 싶을 때
- 초안이 없는데 새 문서를 빠르게 만들고 싶을 때

`poppang-technical-writing` 스킬을 쓰면 문서 유형, 구조, 문장까지 한 번에 정리할 수 있어요. 다만 가끔 빠뜨리는 항목이 있을 수 있으니, 마지막에는 링크 경로, `_meta.json`, `title`, `description`을 직접 확인하세요.

새 문서를 만들 때는 기본적으로 `poppang-technical-writing` 스킬이 `_meta.json`, `title`, `description`까지 같이 처리해요. 이때 스킬은 `섹션`, `title`, `description`을 필수 입력으로 받아요. 셋 중 하나라도 없으면 먼저 값을 확인한 뒤 진행해요.

기존 문서의 `description`을 일괄 정리하거나 따로 손보고 싶을 때만 `rspress-description-generator`를 함께 써도 좋아요.

## 5. 기존 문서를 수정하는 방법

기존 문서가 있다면 파일을 직접 열어서 고쳐도 되고, 스킬로 먼저 다듬어도 돼요.

### 직접 수정할 때

- 첫 문단에서 이 문서가 해결하는 문제를 바로 말해요
- 제목만 읽어도 흐름이 보이게 써요
- 명령어와 경로는 복사해서 바로 쓸 수 있게 적어요
- 같은 문서 안에서는 용어와 말투를 일관되게 맞춰요

### 스킬로 다듬을 때

아래처럼 요청하면 충분해요.

```text
docs/guide/flutter/flutter-first-app.md 문서를 초급 개발자 기준으로 다듬어줘.
poppang-technical-writing 스킬을 쓰고, 구조와 문장을 같이 정리해줘.
```

초안이 길거나 어수선해도 괜찮아요. 독자, 목표, 현재 문제만 분명하면 스킬이 구조부터 다시 잡을 수 있어요.

## 6. 초안이 없을 때 새 문서 시작하기

초안이 없으면 빈 문서부터 억지로 쓰지 않아도 돼요. 먼저 문서 목표와 독자를 정한 뒤 스킬에 초안을 만들어 달라고 요청하세요.

예를 들면 이렇게 시작하면 돼요.

```text
모바일 앱을 처음 만드는 팀원을 위한 Flutter 문서를 만들고 싶어.
추천 문서 유형을 먼저 정하고, 그 형식에 맞춰 초안을 써줘.
poppang-technical-writing 스킬을 사용해줘.
```

새 문서를 만들 때는 아래 정보를 꼭 주세요.

- 이 문서를 어느 섹션에 넣을지
- 페이지 `title`
- 페이지 `description`
- 이 문서를 누가 읽는지
- 문서를 읽고 나서 무엇을 할 수 있어야 하는지
- 이미 있는 관련 문서가 있는지

## 7. 새 페이지를 추가할 때 같이 할 일

이 작업은 보통 `poppang-technical-writing` 스킬이 같이 처리해요. 직접 만들거나 마지막 결과를 점검할 때는 아래 항목을 확인하세요.

### 같은 섹션에 페이지를 추가할 때

예를 들어 `docs/guide/flutter/새문서.md`를 만들었다면, 같은 폴더의 `_meta.json`에 slug를 추가하세요.

- `docs/guide/start/_meta.json`
- `docs/guide/flutter/_meta.json`
- `docs/api/_meta.json`

### 새 섹션 자체를 추가할 때

`docs/guide/` 아래에 새 폴더를 만들었다면 `docs/guide/_meta.json`에도 섹션 헤더를 추가해야 해요.

### 설명도 함께 채우기

새 문서를 만들었다면 frontmatter에 `title`과 `description`이 들어갔는지 확인하세요. 기본적으로는 스킬이 같이 넣어줘요.

예시는 아래와 같아요.

```md
---
title: 문서 제목
description: 이 문서가 다루는 내용과 독자가 얻는 결과를 짧게 설명
---
```

## 8. 검증하고 푸시하기

문서를 수정했다면 로컬에서 먼저 확인하고 올리세요.

```bash
npm run lint
npm run build
git status
```

문제가 없다면 변경 파일을 커밋하고 현재 작업 브랜치에 푸시하세요.

```bash
git add docs/guide/start/contributing.md
git commit -m "docs: update contribution guide"
git push origin <branch-name>
```

여러 파일을 함께 수정했다면 필요한 파일만 골라서 `git add` 하세요.

## 스킬이 잘 해주지만 놓칠 수 있는 것

`poppang-technical-writing` 스킬은 문서 유형, 구조, 문장뿐 아니라 새 페이지의 `_meta.json`, `title`, `description`도 기본적으로 같이 처리해줘요. 그래도 새 페이지를 만들거나 경로를 바꿀 때는 사람이 마지막에 확인해야 할 항목이 있어요. 아래는 자주 실수하는 것들이에요.

- `poppang-technical-writing` 스킬을 썼더라도 링크 경로, `_meta.json`, `title`, `description`을 마지막에 다시 안 봐요
- 새 페이지를 만들고 `_meta.json`을 안 고쳐서 사이드바에 안 보여요
- 새 페이지를 만들었는데 `description`을 안 넣어서 문서 설명이 비어요
- 파일명을 바꾸고 예전 링크를 그대로 둬서 dead link가 생겨요
- 설명은 바꿨는데 독자가 누구인지가 안 보여요
- 설치, 절차, 배경 설명을 한 페이지에 다 넣어서 문서가 길어져요
- `npm run build`를 안 돌려서 링크 오류를 늦게 발견해요
- 초안이 없는데 혼자 처음부터 완벽하게 쓰려다가 시간이 오래 걸려요

문서가 막히면 먼저 짧은 메모만 적어도 괜찮아요. 독자, 목표, 넣을 폴더만 정해두면 `poppang-technical-writing` 스킬로 충분히 시작할 수 있어요.
