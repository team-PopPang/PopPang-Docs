---
title: iOS에서 PopPang-RN 실행하기
description: macOS와 Xcode 환경에서 CocoaPods를 준비하고 iOS Simulator 또는 실제 iPhone으로 PopPang-RN 데모 앱을 실행하는 방법
---

# iOS에서 PopPang-RN 실행하기

macOS에서 Xcode와 CocoaPods를 준비한 뒤 iOS Simulator 또는 실제 iPhone으로 PopPang-RN 데모 앱을 실행하는 방법이에요. 이 문서는 이미 [React Native로 첫 모바일 앱 실행하기](./react-native-first-app.md)의 저장소 복제와 `npm ci`를 마친 상태를 기준으로 해요.

원문: [PopPang-RN README](https://github.com/team-PopPang/PopPang-RN#demo-앱-실행-방법)

## 준비할 것

- macOS
- Node.js 22.11.0 이상
- Xcode와 Xcode Command Line Tools
- iOS Simulator 또는 USB로 연결한 iPhone
- CocoaPods

iOS 네이티브 앱 빌드는 macOS에서만 할 수 있어요. Xcode를 설치하면 iOS Simulator와 빌드 도구를 함께 준비할 수 있어요. 설치 방법은 [React Native 개발 환경 설정](https://reactnative.dev/docs/set-up-your-environment)에서 확인할 수 있어요.

## 1. Xcode와 Simulator 준비하기

Xcode를 설치한 뒤 Xcode 설정에서 최신 Command Line Tools를 선택하세요. 이어서 Xcode의 Platforms 설정에서 사용할 iOS Simulator를 설치하고 실행하세요.

실제 iPhone을 사용할 때는 USB로 연결한 뒤 기기 신뢰와 개발 권한을 허용하세요. 코드 서명 선택이 필요하면 Xcode에서 팀의 개발 계정을 선택해야 해요.

## 2. iOS 의존성 설치하기

처음 실행하거나 `ios/Pods`가 없는 경우에는 iOS 디렉터리에서 Bundler와 CocoaPods 의존성을 설치하세요.

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

`bundle exec pod install`은 `ios/Podfile`에 정의된 iOS 네이티브 의존성을 설치해요.

## 3. Metro와 iOS 앱 실행하기

프로젝트 루트에서 터미널을 두 개 열어 실행하세요.

첫 번째 터미널에서는 Metro를 실행해요.

```bash
npm run start
```

두 번째 터미널에서는 iOS 데모 앱을 빌드하고 실행해요.

```bash
npm run ios
```

빌드가 끝나면 iOS Simulator가 열리고 PopPang-RN Debug 앱의 데모 피처 목록이 보여요.

## 4. 실제 iPhone에서 실행하기

README에 정의된 명령으로 연결된 iOS 기기를 확인하세요.

```bash
npm run ios -- --list-devices
```

목록에서 확인한 기기 이름 또는 UDID를 지정해 앱을 실행할 수 있어요.

```bash
# 기기 이름으로 실행
npm run ios -- --device "기기 이름"

# UDID로 실행
npm run ios -- --device "기기-UDID"
```

## 자주 막히는 지점

### CocoaPods 또는 iOS 빌드 캐시 오류가 날 때

README의 iOS Pods 초기화 순서로 Pods와 빌드 결과를 지운 뒤 다시 설치하세요.

```bash
rm -rf ios/Pods ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/PopPangRN-*

cd ios
bundle exec pod install
cd ..

npm run ios
```

### Metro 연결 오류가 날 때

Metro를 실행한 터미널이 계속 열려 있는지 확인하세요. 서버가 멈췄거나 캐시가 꼬였다면 README의 Metro 캐시 초기화 명령을 실행한 뒤 다시 시작하세요.

```bash
pkill -f "react-native/cli.js start" || true
watchman watch-del-all || true
rm -rf $TMPDIR/metro-* $TMPDIR/haste-map-*

npm start -- --reset-cache
```

## 확인하기

- macOS에서 Xcode와 Command Line Tools를 준비했어요.
- iOS Simulator 또는 실제 iPhone이 실행 가능한 상태예요.
- iOS 의존성을 설치했어요.
- Metro가 실행 중이에요.
- `npm run ios`로 데모 피처 목록이 열렸어요.
