---
title: 기존 Android 앱에 PopPang-RN 넣기
description: 기존 Android 프로젝트에서 PopPang-RN 릴리즈 버전을 확인하고 Maven 저장소와 JavaScript 번들을 내려받아 Gradle과 화면 호출까지 설정하는 방법
---

# 기존 Android 앱에 PopPang-RN 넣기

기존 Android 앱에 팝업 요청 기능을 넣는 방법이에요. PopPang-RN 저장소를 앱에 복제하거나, 호스트 앱에 `node_modules`를 설치할 필요는 없어요. **같은 릴리즈의 Android Maven 패키지와 JavaScript bundle을 내려받아** 호스트 앱에 배치한 뒤 SDK를 호출하면 돼요.

이 문서는 이미 존재하는 Android 프로젝트에 넣는 과정을 다뤄요. PopPang-RN 데모 앱을 직접 실행하려면 [첫 모바일 앱 실행하기](./react-native-first-app.md)를 참고하세요.

원문: [PopPang-RN README의 Android 클라이언트 앱 가이드](https://github.com/team-PopPang/PopPang-RN#클라이언트-앱android)

## 완료하면 이렇게 구성돼요

```text
HostProject/
├── scripts/
│   └── download-rn-release.sh
├── Vendor/
│   └── PopPangRN/
│       └── repository/                 # 릴리즈의 로컬 Maven 저장소
└── app/
    └── src/main/assets/
        └── index.android.bundle        # 릴리즈의 React Native JavaScript bundle
```

호스트 앱이 `com.poppang:poppang-rn-android` SDK를 의존성으로 추가하면, SDK가 위 bundle을 사용해 PopPang-RN 화면을 열어요. `app`이 아닌 모듈에서 앱을 빌드한다면 아래의 `app/src/main/assets`를 실제 앱 모듈 경로로 바꾸세요.

## 준비할 것

- Android 프로젝트와 Android Studio
- Android 앱 모듈의 Gradle 설정을 수정할 권한
- GitHub 릴리즈를 받기 위한 [GitHub CLI](https://cli.github.com/)와 로그인 상태
- `unzip`

GitHub CLI를 처음 사용한다면 아래 명령으로 로그인하세요.

```bash
gh auth login
```

## 1. 설치할 릴리즈 버전을 확인해요

먼저 배포된 버전 목록과 파일을 확인하세요. 앱 코드, Maven 패키지, bundle은 반드시 **같은 태그**를 사용해야 해요.

```bash
gh release list --repo team-PopPang/PopPang-RN

# 목록에서 선택한 태그의 파일을 확인해요.
VERSION=v0.1.0
gh release view "$VERSION" --repo team-PopPang/PopPang-RN
```

`VERSION=v0.1.0`은 예시예요. 항상 릴리즈 목록에서 실제로 도입할 태그로 바꾸세요.

Android에 필요한 파일은 아래 두 개예요.

| 파일                                   | 용도                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `poppang-rn-android-maven-<태그>.zip`  | `poppang-rn-android` SDK, React Native, Hermes AAR을 담은 로컬 Maven 저장소예요. |
| `poppang-rn-android-bundle-<태그>.zip` | 런타임에 로드할 `index.android.bundle`이에요.                                    |

예를 들어 태그가 `v0.1.0`이면 의존성 버전은 `0.1.0`이에요. Gradle에는 태그의 `v`를 뺀 버전을 입력해야 해요.

| GitHub 릴리즈 태그 | Gradle 의존성 버전 |
| ------------------ | ------------------ |
| `v0.1.0`           | `0.1.0`            |

## 2. 릴리즈 파일을 프로젝트에 내려받아 배치해요

아래 스크립트를 호스트 프로젝트의 `scripts/download-rn-release.sh`로 저장하세요. 실행할 때 첫 번째 인자로 선택한 릴리즈 태그를 넘기면 돼요.

```bash
#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-v0.1.0}" # gh release list에서 선택한 실제 태그
REPO=team-PopPang/PopPang-RN
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

MAVEN_ASSET="poppang-rn-android-maven-$VERSION.zip"
BUNDLE_ASSET="poppang-rn-android-bundle-$VERSION.zip"

gh release download "$VERSION" --repo "$REPO" \
  --pattern "$MAVEN_ASSET" --dir "$TMP_DIR" --clobber
gh release download "$VERSION" --repo "$REPO" \
  --pattern "$BUNDLE_ASSET" --dir "$TMP_DIR" --clobber

rm -rf "$ROOT_DIR/Vendor/PopPangRN/repository"
rm -f "$ROOT_DIR/app/src/main/assets/index.android.bundle"
mkdir -p "$ROOT_DIR/Vendor/PopPangRN" "$ROOT_DIR/app/src/main/assets"

unzip -q "$TMP_DIR/$MAVEN_ASSET" -d "$TMP_DIR/maven"
unzip -q "$TMP_DIR/$BUNDLE_ASSET" -d "$TMP_DIR/bundle"

mv "$TMP_DIR/maven/repository" "$ROOT_DIR/Vendor/PopPangRN/repository"
mv "$TMP_DIR/bundle/android/index.android.bundle" \
  "$ROOT_DIR/app/src/main/assets/index.android.bundle"
```

실행 권한을 주고 실행하세요.

```bash
chmod +x scripts/download-rn-release.sh
./scripts/download-rn-release.sh v0.1.0
```

이 스크립트는 이전 파일을 지운 뒤 새 버전을 넣어요. 따라서 릴리즈 태그를 바꿀 때는 이 스크립트를 다시 실행하고, bundle과 Maven 저장소가 같은 버전인지 함께 확인하세요.

### 다운로드 파일을 Git에 넣을지 정해요

`repository`는 수백 MB가 될 수 있어요. 팀의 배포 방식에 따라 다음 중 하나를 정하세요.

- 사내 소스 저장소 또는 Git LFS로 함께 관리해요.
- CI와 개발 환경에서 위 스크립트를 실행해 내려받아요.

어느 방식을 쓰더라도 `Vendor/PopPangRN/repository`와 `app/src/main/assets/index.android.bundle`이 빌드 시점에 존재해야 해요. bundle만 있거나 Maven 저장소만 있으면 정상 동작하지 않아요.

## 3. Gradle이 로컬 Maven 저장소를 보도록 설정해요

프로젝트 루트의 `settings.gradle` 또는 `settings.gradle.kts`에서 `dependencyResolutionManagement`의 `repositories`에 아래 저장소를 추가하세요. 기존 `google()`과 `mavenCentral()`은 유지해야 해요.

```groovy
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("$rootDir/Vendor/PopPangRN/repository")
        }
    }
}
```

`repositoriesMode`를 이미 설정했다면 그 설정은 그대로 두고 `maven { ... }` 블록만 추가하세요. 앱 모듈의 `build.gradle`에 저장소를 따로 추가하는 방식보다 `settings.gradle`에서 한 번 관리하는 편이 모든 모듈에서 같은 의존성을 해석하기 쉬워요.

## 4. 앱 모듈에 SDK를 추가해요

`app/build.gradle` 또는 실제 앱 모듈의 Gradle 파일에 SDK를 추가하세요.

```groovy
dependencies {
    implementation("com.poppang:poppang-rn-android:0.1.0")
}
```

여기서 `0.1.0`은 앞에서 내려받은 `v0.1.0` 태그에 대응하는 예시예요. 다른 태그를 받았다면 같은 버전으로 바꾸세요.

Gradle 동기화를 한 뒤 의존성이 로컬 Maven 저장소에서 해석되는지 확인하세요.

```bash
./gradlew :app:assembleDebug
```

`Could not find com.poppang:poppang-rn-android` 오류가 나면 다음을 순서대로 확인하세요.

1. `Vendor/PopPangRN/repository`가 실제로 존재하는지 확인해요.
2. `settings.gradle`의 경로가 프로젝트 루트 기준으로 맞는지 확인해요.
3. Gradle 버전과 릴리즈 태그의 `v`를 뺀 버전이 같은지 확인해요.

## 5. 원하는 기능을 여는 코드를 추가해요

Android에서는 `PopPangRnSdk.createIntent`로 화면을 만들고 `ActivityResultLauncher`로 결과 이벤트를 받는 방식이에요. 팝업 요청 화면을 여는 예시는 아래와 같아요.

```kotlin
import android.app.Activity
import androidx.activity.result.contract.ActivityResultContracts
import com.poppang.rn.PopPangRnSdk

private val popupRequestLauncher =
    registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode != Activity.RESULT_OK) return@registerForActivityResult

        when (result.data?.getStringExtra(PopPangRnSdk.EXTRA_EVENT)) {
            PopPangRnSdk.NativeEvent.POPUP_REQUEST_SUBMITTED -> {
                // 요청이 등록된 뒤 호스트 앱의 목록을 새로고침해요.
            }
            PopPangRnSdk.NativeEvent.POPUP_REQUEST_BACK -> {
                // RN 화면에서 뒤로 가기를 눌렀어요.
            }
        }
    }

private fun openPopupRequest(userUuid: String) {
    val intent = PopPangRnSdk.createIntent(
        context = this,
        feature = "request",
        userUuid = userUuid,
        nativeEvents = setOf(
            PopPangRnSdk.NativeEvent.POPUP_REQUEST_SUBMITTED,
            PopPangRnSdk.NativeEvent.POPUP_REQUEST_BACK,
        ),
    )
    popupRequestLauncher.launch(intent)
}
```

`userUuid`에는 로그인한 사용자의 UUID를 전달하세요. 임시 값이나 다른 식별자를 넣으면 PopPang 서비스가 사용자를 식별하지 못할 수 있어요.

### 기능과 이벤트를 선택해요

`feature`는 정확한 문자열을 사용해야 해요. 기능마다 전달할 수 있는 이벤트도 달라요.

| 기능           | `feature` 값         | 용도                           | 지원 이벤트                                     |
| -------------- | -------------------- | ------------------------------ | ----------------------------------------------- |
| 팝업 요청      | `request`            | 일반 사용자가 팝업을 요청해요. | `POPUP_REQUEST_SUBMITTED`, `POPUP_REQUEST_BACK` |
| 팝업 요청 관리 | `request-management` | 관리자가 요청을 관리해요.      | `POPUP_REQUEST_MANAGEMENT_BACK`                 |

관리 화면을 열 때는 `feature`와 이벤트만 바꾸면 돼요.

```kotlin
val intent = PopPangRnSdk.createIntent(
    context = this,
    feature = "request-management",
    userUuid = adminUuid,
    nativeEvents = setOf(PopPangRnSdk.NativeEvent.POPUP_REQUEST_MANAGEMENT_BACK),
)
```

`nativeEvents`를 전달하지 않으면 React Native 화면은 호스트 앱으로 이벤트를 보내지 않고, 커스텀 헤더의 뒤로 가기 동작도 제공하지 않아요. 호스트 화면을 갱신하거나 닫기 처리가 필요하다면 필요한 이벤트를 명시하세요.

## 6. Debug와 배포 버전을 구분해서 확인해요

호스트 앱 통합은 **Release 빌드**에서 확인해야 해요. SDK는 호스트 앱에 넣은 `index.android.bundle`을 사용하므로 Metro를 실행할 필요가 없어요.

```bash
./gradlew :app:assembleRelease
```

아래 항목을 모두 확인하면 통합이 끝난 거예요.

- `Vendor/PopPangRN/repository`와 `app/src/main/assets/index.android.bundle`이 같은 릴리즈에서 왔어요.
- Gradle이 `com.poppang:poppang-rn-android` 의존성을 정상적으로 받았어요.
- 호스트 앱에 React Native 프로젝트나 `node_modules`를 추가하지 않았어요.
- 로그인한 사용자의 실제 UUID로 요청 화면이 열려요.
- 요청 등록 또는 뒤로 가기 이벤트가 호스트 앱에서 처리돼요.

## 자주 막히는 지점

### `index.android.bundle`을 찾지 못할 때

파일 이름과 위치가 정확히 `app/src/main/assets/index.android.bundle`인지 확인하세요. 앱 모듈명이 다르다면 해당 모듈의 `src/main/assets` 아래에 있어야 해요. Android Studio의 Assets 폴더 표시만 믿지 말고 파일 시스템 경로를 직접 확인하는 편이 안전해요.

### 릴리즈를 올렸는데 화면이 이전 코드일 때

Maven ZIP만 바꾸거나 bundle ZIP만 바꾸면 네이티브 SDK와 JavaScript 코드가 서로 다른 버전이 될 수 있어요. 두 파일을 같은 태그로 다시 내려받고, 이전 파일이 남지 않았는지 확인하세요.

### 앱에 React Native를 별도로 설치해야 하는지 궁금할 때

그럴 필요 없어요. PopPang-RN 릴리즈의 로컬 Maven 저장소에 필요한 Android AAR과 React Native/Hermes 의존성이 포함돼 있어요. 호스트 앱은 이 문서의 SDK 의존성, Maven 저장소, bundle만 설정하면 돼요.
