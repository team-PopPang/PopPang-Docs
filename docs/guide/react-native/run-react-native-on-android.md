---
title: Android에서 PopPang-RN 실행하기
description: Android Studio와 JDK를 준비하고 Android Emulator 또는 실제 기기에서 Metro를 통해 PopPang-RN 데모 앱을 실행하는 방법
---

# Android에서 PopPang-RN 실행하기

Android Studio와 JDK를 준비한 뒤 Android Emulator 또는 실제 Android 기기에서 PopPang-RN 데모 앱을 실행하는 방법이에요. 이 문서는 이미 [React Native로 첫 모바일 앱 실행하기](./react-native-first-app.md)의 저장소 복제와 `npm ci`를 마친 상태를 기준으로 해요.

원문: [PopPang-RN README](https://github.com/team-PopPang/PopPang-RN#demo-앱-실행-방법)

## 준비할 것

- Node.js 22.11.0 이상
- JDK 17
- Android Studio
- Android SDK Platform 36과 Android SDK Build-Tools 36.0.0
- Android Emulator 또는 USB 디버깅을 켠 실제 Android 기기

PopPang-RN의 Android Gradle 설정은 `compileSdkVersion`과 `targetSdkVersion`에 36을, Build Tools에 36.0.0을 사용해요. Android Studio에서 이 버전을 설치해야 앱을 같은 설정으로 빌드할 수 있어요.

## 1. Android Studio와 SDK 준비하기

Android Studio를 설치한 뒤 SDK Manager를 열어 아래 항목을 설치하세요.

- Android SDK Platform 36
- Android SDK Build-Tools 36.0.0
- Android SDK Command-line Tools
- Android Emulator

Android Emulator를 사용할 예정이라면 Device Manager에서 가상 기기를 하나 만들고 먼저 실행하세요. 실제 기기를 사용할 때는 개발자 옵션에서 USB 디버깅을 켠 뒤 USB로 연결하세요.

Android SDK가 기본 macOS 경로에 설치됐다면 셸 설정 파일에 아래 값을 추가하세요.

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

설정을 적용한 뒤 새 터미널을 열거나 셸 설정 파일을 다시 불러오세요. SDK를 다른 위치에 설치했다면 Android Studio의 SDK Manager에 표시된 실제 경로를 사용해야 해요.

운영체제별 설치 경로와 Android Studio 설정은 [React Native 개발 환경 설정](https://reactnative.dev/docs/set-up-your-environment)에서 확인할 수 있어요.

## 2. JDK 17 확인하기

아래 명령으로 Java 버전을 확인하세요.

```bash
java -version
```

PopPang-RN의 `npm run android` 스크립트는 macOS에서 Homebrew `openjdk@17`의 일반적인 설치 경로를 찾고 `JAVA_HOME`을 설정해요. 다른 JDK를 사용한다면 `JAVA_HOME`이 JDK 17 경로를 가리키는지 확인하세요.

```bash
export JAVA_HOME="/JDK-17-설치-경로"
export PATH="$JAVA_HOME/bin:$PATH"
```

## 3. 실행할 기기 확인하기

Emulator를 시작하거나 실제 기기를 연결한 뒤 아래 명령을 실행하세요.

```bash
adb devices
```

목록에 기기 또는 Emulator가 `device` 상태로 보이면 준비가 끝난 거예요. 아무 기기도 보이지 않으면 Emulator를 먼저 부팅하거나 실제 기기의 USB 디버깅 권한을 허용하세요.

## 4. Metro와 Android 앱 실행하기

프로젝트 루트에서 터미널을 두 개 열어 실행하세요.

첫 번째 터미널에서는 Metro를 실행해요.

```bash
npm run start
```

두 번째 터미널에서는 Android 앱을 빌드하고 실행해요.

```bash
npm run android
```

이 명령은 프로젝트의 `scripts/run-android.sh`를 실행한 뒤 `npx react-native run-android`로 이어져요. 빌드가 끝나면 선택한 Android 기기에서 PopPang-RN Debug 앱이 열리고 데모 피처 목록이 보여요.

## 자주 막히는 지점

### Java를 찾지 못할 때

`java -version`으로 JDK 17이 설치됐는지 확인하세요. 다른 Java 버전이 먼저 선택됐다면 `JAVA_HOME`과 `PATH`를 JDK 17로 다시 설정하세요.

### 기기가 보이지 않을 때

`adb devices`를 다시 실행하세요. Emulator는 완전히 부팅된 뒤에 나타나요. 실제 기기는 USB 디버깅을 허용해야 해요.

### Gradle 캐시 오류가 날 때

README의 Android 캐시 초기화 순서로 빌드 캐시를 비우고 다시 실행하세요.

```bash
cd android
./gradlew --stop
cd ..

rm -rf ~/.gradle/caches/9.3.1/transforms
rm -rf android/.gradle android/build android/app/build

cd android
./gradlew assembleDebug --refresh-dependencies
cd ..

npm run android
```

## 확인하기

- Android Studio에서 SDK Platform 36과 Build-Tools 36.0.0을 설치했어요.
- `java -version`이 JDK 17을 가리켜요.
- `adb devices`에 실행할 기기가 보여요.
- Metro가 실행 중이에요.
- `npm run android`으로 데모 피처 목록이 열렸어요.
