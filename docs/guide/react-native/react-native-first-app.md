---
title: React Native로 첫 모바일 앱 실행하기
description: PopPang-RN을 내려받아 의존성을 설치하고 Metro를 실행한 뒤 Android 또는 iOS 데모 앱의 첫 화면을 확인하는 가이드
---

# React Native로 첫 모바일 앱 실행하기

PopPang-RN은 iOS와 Android에서 공통으로 사용할 화면을 React Native로 개발하는 프로젝트예요. 이 문서에서는 저장소를 내려받고, 개발 서버인 Metro를 실행한 뒤, Android 또는 iOS에서 데모 앱의 첫 화면을 확인하는 가장 짧은 흐름을 안내해요.

원문: [PopPang-RN README](https://github.com/team-PopPang/PopPang-RN#readme)

이 문서를 마치면 아래 작업을 할 수 있어요.

- `npm ci`로 프로젝트 의존성을 설치해요.
- `npm run start`로 Metro 개발 서버를 실행해요.
- Android Emulator, iOS Simulator 또는 실제 기기에서 데모 앱을 실행해요.
- 데모 피처 목록이 보이는지 확인해요.

## 시작하기 전에 준비할 것

- Git
- Node.js 22.11.0 이상
- Android 또는 iOS 실행 환경

`PopPang-RN`은 Node.js 22.11.0 이상을 요구해요. 플랫폼별 도구는 아래 문서에서 준비하세요.

- [Android에서 PopPang-RN 실행하기](./run-react-native-on-android.md)
- [iOS에서 PopPang-RN 실행하기](./run-react-native-on-ios.md)

## 1. 저장소 내려받기

터미널에서 저장소를 복제하고 프로젝트 폴더로 이동하세요.

```bash
git clone https://github.com/team-PopPang/PopPang-RN.git
cd PopPang-RN
```

## 2. 의존성 설치하기

개발 환경을 처음 준비하거나 lockfile에 맞춰 다시 설치할 때는 `npm ci`를 사용하세요.

```bash
npm ci
```

`npm install`은 라이브러리를 추가하거나 삭제할 때만 사용해요. 평소에는 `npm ci`가 `package-lock.json`에 고정된 의존성을 그대로 설치하므로 팀원과 같은 환경을 맞추기 쉬워요.

## 3. Metro 개발 서버 실행하기

프로젝트 루트에서 Metro를 실행하세요. 이 터미널은 앱을 실행하는 동안 계속 열어 두세요.

```bash
npm run start
```

Metro는 JavaScript와 TypeScript 변경 사항을 앱에 전달하는 React Native 개발 서버예요.

## 4. 첫 데모 앱 실행하기

Metro가 실행 중인 상태에서 새 터미널을 열고, 사용할 플랫폼에 맞는 명령을 실행하세요.

```bash
# Android
npm run android

# iOS
npm run ios
```

Android는 Emulator 또는 USB로 연결한 실제 기기가 필요해요. iOS는 macOS에서 Xcode와 iOS Simulator 또는 연결한 iPhone이 필요해요.

명령이 완료되면 Debug 앱의 `App.tsx`가 데모 피처 목록을 보여줘요. 이 화면이 뜨면 개발 환경과 Metro 연결이 정상이에요.

## 플랫폼별 실행 가이드

첫 실행에서 플랫폼 도구 설정 때문에 막혔다면 아래 문서를 이어서 보세요.

- [Android에서 PopPang-RN 실행하기](./run-react-native-on-android.md): Android Studio, JDK, Emulator 또는 실제 Android 기기에서 실행해요.
- [iOS에서 PopPang-RN 실행하기](./run-react-native-on-ios.md): Xcode, CocoaPods, Simulator 또는 실제 iPhone에서 실행해요.

## 확인하기

아래 항목을 모두 확인하면 첫 실행이 끝난 상태예요.

- `node --version`이 22.11.0 이상이에요.
- `npm ci`가 오류 없이 끝났어요.
- `npm run start`를 실행한 터미널에 Metro가 실행 중이에요.
- `npm run android` 또는 `npm run ios`가 앱을 열었어요.
- 앱에 데모 피처 목록이 보여요.
