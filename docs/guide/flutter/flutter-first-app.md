---
title: Flutter로 첫 모바일 앱 실행하기
description: Flutter를 처음 쓰는 개발자가 개발 환경을 준비하고 첫 프로젝트를 만든 뒤 Android 또는 iOS에서 앱을 실행하는 시작하기 가이드
---

# Flutter로 첫 모바일 앱 실행하기

Flutter를 처음 써도 괜찮아요. 이 문서는 개발 환경을 준비하고, 새 프로젝트를 만든 뒤, 실제 기기나 에뮬레이터에서 앱이 뜨는지 확인하는 가장 짧은 흐름만 다뤄요.

이 문서는 모바일 앱을 처음 만드는 초급 개발자를 위한 시작하기 가이드예요. Flutter 전체를 설명하지는 않아요. 대신 첫 앱을 실행하는 데 꼭 필요한 단계만 안내해요.

문서를 마치면 아래 작업을 할 수 있어요.

- `flutter doctor`로 설치 상태 점검하기
- `flutter create`로 새 프로젝트 만들기
- `flutter run`으로 첫 앱 실행하기
- `lib/main.dart`를 수정하고 화면 변화 확인하기

## 준비할 것

- VS Code 또는 Android Studio
- Android Emulator 또는 실제 Android 기기
- iOS Simulator 또는 실제 iPhone
- Flutter 설치에 필요한 운영체제별 도구

Android 앱은 Windows 또는 macOS에서 시작할 수 있어요. iOS 앱은 macOS와 Xcode가 필요해요.

## 1. 개발 환경 준비하기

### Flutter SDK 설치

먼저 운영체제에 맞는 공식 설치 문서를 따라 Flutter SDK를 설치하고 `flutter` 명령을 사용할 수 있게 설정해요.

- [Flutter 설치 문서](https://docs.flutter.dev/install)
- [빠른 시작 가이드](https://docs.flutter.dev/install/quick)

설치가 끝나면 터미널을 다시 열고 `flutter` 명령이 인식되는지 확인하세요.

### Android 실행 환경 준비

Android 앱을 실행하려면 Android Studio와 Android SDK가 필요해요. Android Emulator를 함께 설치하면 실제 기기가 없어도 앱을 실행할 수 있어요.

아래 항목만 먼저 준비하면 돼요.

- 최신 안정 버전의 Android Studio 설치
- Android SDK와 Command-line Tools 설치
- Android Emulator 설치
- Android SDK 라이선스 동의

라이선스 동의는 아래 명령으로 진행해요.

```bash
flutter doctor --android-licenses
```

자세한 단계는 [Android 개발 환경 설정](https://docs.flutter.dev/platform-integration/android/setup) 문서를 보면 돼요.

### iOS 실행 환경 준비

iOS 앱을 실행하려면 macOS에서 Xcode를 설치해야 해요. iOS Simulator를 쓰면 iPhone이 없어도 기본 실행 테스트를 할 수 있어요.

아래 항목을 준비해요.

- 최신 버전의 Xcode 설치
- Xcode command-line tools 설정
- Xcode 라이선스 동의
- CocoaPods 설치
- iOS Simulator 실행

자세한 단계는 [iOS 개발 환경 설정](https://docs.flutter.dev/platform-integration/ios/setup) 문서를 보면 돼요.

## 2. 설치 상태 확인하기

설치가 끝나면 아래 명령으로 빠진 항목이 없는지 확인해요.

```bash
flutter doctor
```

이 명령은 Flutter SDK, Android 도구, Xcode, 연결된 기기 상태를 함께 점검해요. 경고나 오류가 나오면 먼저 해결한 뒤 다음 단계로 넘어가세요.

실행할 수 있는 기기를 확인하려면 아래 명령을 사용해요.

```bash
flutter devices
```

기기가 보이지 않으면 Android Emulator나 iOS Simulator를 먼저 실행하거나, 실제 기기를 연결한 뒤 다시 확인하세요.

## 3. 새 프로젝트 만들기

이제 첫 Flutter 앱을 만들어요.

```bash
flutter create my_first_app
cd my_first_app
```

프로젝트를 만들면 여러 파일과 폴더가 생겨요. 처음에는 아래 두 파일만 먼저 보면 충분해요.

- `lib/main.dart`: 앱이 시작되는 기본 Dart 파일
- `pubspec.yaml`: 패키지, 에셋, 프로젝트 설정을 관리하는 파일

`android/`와 `ios/` 폴더는 각 플랫폼 전용 설정을 담고 있어요. 처음에는 구조만 알고 넘어가면 충분해요.

## 4. 첫 화면 만들기

`lib/main.dart` 파일을 열고 내용을 아래 예제로 바꿔요.

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My First Flutter App',
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Flutter 시작하기'),
        ),
        body: const Center(
          child: Text('안녕하세요, Flutter!'),
        ),
      ),
    );
  }
}
```

이 예제에서 먼저 기억하면 좋은 건 네 가지예요.

- `main()`: 앱 시작 지점
- `runApp()`: 화면에 보여줄 앱 시작
- `MaterialApp`: 앱 전체 설정
- `Scaffold`: 화면 기본 뼈대

## 5. 앱 실행하기

Android Emulator, iOS Simulator, 또는 실제 기기를 준비한 뒤 아래 명령을 실행해요.

```bash
flutter run
```

앱이 정상적으로 실행되면 상단 앱 바에 `Flutter 시작하기`, 화면 중앙에 `안녕하세요, Flutter!`가 보여요.

실행 중에 코드를 바꾸면 Flutter의 hot reload로 변경 내용을 빠르게 확인할 수 있어요. 예를 들어 `안녕하세요, Flutter!`를 `첫 앱이 실행되었습니다.`로 바꾼 뒤 저장해 보세요.

## 6. 다음에 해보면 좋은 것

첫 앱 실행까지 끝냈다면 이제 Flutter의 기본 학습 흐름으로 넘어가면 돼요.

- 위젯과 레이아웃 이해하기
- 상태 관리 기본 익히기
- 패키지 추가하기
- 네트워크 요청과 화면 이동 다뤄 보기

공식 학습 자료는 아래에서 이어서 볼 수 있어요.

- [Flutter 학습 자료](https://docs.flutter.dev/reference/learning-resources)
- [Widget catalog](https://docs.flutter.dev/ui/widgets)
- [State management](https://docs.flutter.dev/data-and-backend/state-mgmt/intro)

## 자주 막히는 지점

### `flutter` 명령이 없다고 나올 때

Flutter SDK의 `bin` 디렉터리가 PATH에 들어가지 않았을 가능성이 커요. 설치 문서로 돌아가 환경 변수 설정을 다시 확인하세요.

### `flutter doctor`에서 Android 관련 오류가 나올 때

Android Studio만 설치해서는 부족할 수 있어요. Android SDK, Emulator, Command-line Tools가 모두 설치되었는지 확인하고 `flutter doctor --android-licenses`를 다시 실행하세요.

### 실행할 기기가 보이지 않을 때

에뮬레이터나 시뮬레이터를 먼저 실행해야 해요. 실제 기기를 연결했다면 Android는 USB 디버깅, iPhone은 신뢰 설정이 되어 있는지 확인하세요.

### iOS 빌드가 실패할 때

Xcode, command-line tools, CocoaPods 설정이 빠졌을 수 있어요. macOS에서만 iOS 빌드가 가능하다는 점도 함께 확인하세요.

## 체크리스트

- `flutter doctor`를 실행했고 치명적인 오류가 없다
- `flutter devices`에서 실행할 기기가 보인다
- `flutter create my_first_app`로 프로젝트를 만들었다
- `flutter run`으로 첫 앱을 실행했다
- `lib/main.dart`를 수정하고 화면 변화를 확인했다

여기까지 끝냈다면 Flutter를 시작할 준비가 끝난 상태예요. 다음에는 위젯 구조와 상태 변화를 중심으로 화면을 조금씩 확장해 보세요.
