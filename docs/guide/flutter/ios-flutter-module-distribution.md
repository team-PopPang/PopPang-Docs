---
title: iOS 앱에 Flutter 모듈 연결하고 배포하기
description: PopPang-Flutter 모듈을 iOS 앱에 로컬로 연결하거나 Swift Package 산출물로 배포해서 붙이는 방법을 정리한 가이드
---

# iOS 앱에 Flutter 모듈 연결하고 배포하기

이 문서는 `PopPang-Flutter` 모듈을 `PopPang-iOS` 같은 기존 iOS 앱에 붙이는 방법을 정리해요. 그런데 iOS 쪽 연결 방식은 성격이 두 가지로 갈려요. 하나는 개발용으로 빠르게 붙이는 기본 세팅이고, 다른 하나는 버전 있는 의존성처럼 관리하는 모듈화 세팅이에요.

이 문서는 이 두 흐름을 명확히 나눠서 설명해요. Flutter 공식 iOS add-to-app 문서를 기준으로 삼고, 팝팡 팀에서 쓰는 GitHub Release 배포 방식은 별도 경로로 분리했어요.

문서를 마치면 아래 작업을 할 수 있어요.

- Flutter 모듈을 생성하고 기본 디렉터리를 준비해요
- iOS 앱에 Flutter 모듈을 직접 연결해 로컬에서 개발해요
- Swift Package 산출물을 만들어 Xcode 프로젝트에 붙여요
- 재사용 가능한 `FlutterEngine`으로 Flutter 화면을 열어요
- iOS 산출물을 zip으로 묶고 GitHub Release asset으로 배포해요

## 어떤 경로를 보면 되는지 먼저 정하기

이 문서는 아래 두 경로로 나뉘어요.

- 기본 세팅 방법: 지금 바로 `PopPang-iOS`에서 Flutter 화면을 띄우고 개발하고 싶을 때 봐요.
- 모듈화 세팅 방법: Flutter 산출물을 버전으로 관리하고, zip이나 릴리즈 자산처럼 배포하고 싶을 때 봐요.

빠르게 기능을 붙여야 한다면 먼저 기본 세팅 방법부터 보세요. 팀 공통 배포 체계까지 만들려면 모듈화 세팅 방법까지 이어서 보면 돼요.

## 먼저 알고 갈 것

Flutter 공식 `Integrate a Flutter app into your iOS project` 문서는 2026년 6월 8일 업데이트 기준으로 Swift Package Manager 흐름을 중심으로 안내해요. 이 문서도 새 통합은 그 흐름을 기본값으로 잡아요.

다만 기존 프로젝트에서는 Podfile 기반 연결을 여전히 유지할 수 있어요. 그래서 이 문서는 기본 세팅에서는 Podfile 방식도 다루고, 모듈화 세팅에서는 Swift Package Manager 중심으로 정리해요.

공식 문서는 처음 통합하는 경우 Flutter module보다 Flutter application을 권장해요. 하지만 팝팡 팀은 모듈 구조를 이미 전제로 두고 있으니, 이 문서는 module 기준으로 정리해요.

## 준비할 것

- macOS
- Xcode
- Flutter SDK
- `PopPang-iOS` 저장소
- `PopPang-Flutter` 저장소
- GitHub CLI (`gh`)

`flutter build swift-package --platform ios` 명령이 없다면 먼저 `flutter --version`으로 현재 버전을 확인하세요.

## 1. Flutter 모듈 만들고 기본 구조 잡기

비어 있는 `PopPang-Flutter` 디렉터리에서 아래 명령으로 모듈을 만들어요.

```bash
flutter create --template module --project-name poppang_flutter --org com.poppang .
```

그다음 팀에서 쓰는 기본 폴더를 만들어요.

```bash
mkdir -p \
  lib/app/bootstrap \
  lib/app/registry \
  lib/contract \
  lib/features/admin_popup_management/{presentation,domain,usecase,repository,infrastructure} \
  lib/host_bridge \
  lib/shared

touch lib/main_demo.dart lib/main_hosted.dart
```

이 구조는 두 가지 실행 진입점을 나누기 좋아요.

- `lib/main_demo.dart`: Flutter 단독 실행용
- `lib/main_hosted.dart`: iOS 호스트 앱에 붙는 실행용

앱 실행은 아래처럼 나눠요.

```bash
# hosted 기본 실행
flutter run

# demo 실행
flutter run --target lib/main_demo.dart
```

## 2. 기본 세팅 방법

이 경로는 로컬에서 바로 붙여서 개발하는 흐름이에요. `PopPang-iOS`와 `PopPang-Flutter`를 함께 열고, 빠르게 화면을 띄우는 데 집중해요.

### 프로젝트 위치를 맞추기

기본 세팅도 형제 폴더 구조를 쓰는 편이 관리하기 쉬워요.

```text
PopPang/
├─ PopPang-iOS/
└─ PopPang-Flutter/
```

### Flutter 의존성 갱신하기

`PopPang-Flutter`에서 먼저 의존성을 맞춰요.

```bash
cd PopPang-Flutter
flutter pub get
```

### Podfile로 Flutter 모듈 연결하기

`PopPang-iOS/Podfile`에 Flutter 모듈 경로를 연결해요.

```ruby
flutter_application_path = File.expand_path('../PopPang-Flutter', __dir__)
load File.join(flutter_application_path, '.ios', 'Flutter', 'podhelper.rb')

target 'PopPang' do
  install_all_flutter_pods(flutter_application_path)
end

post_install do |installer|
  flutter_post_install(installer)
end
```

설정이 끝나면 `PopPang-iOS`에서 `pod install`을 실행해요.

```bash
cd PopPang-iOS
pod install
```

### `FlutterEngine`을 한 번만 띄우고 재사용하기

Flutter 공식 문서는 오래 살아 있는 `FlutterEngine`을 미리 띄워두는 방식을 권장해요. 첫 화면이 더 빨리 뜨고, Flutter 상태도 `FlutterViewController`보다 오래 유지할 수 있기 때문이에요.

팝팡 팀에서는 아래처럼 전용 호스트 객체를 두고 재사용하면 관리하기 쉬워요.

```swift
import Flutter
import FlutterPluginRegistrant

final class FlutterFeatureHost {
    static let shared = FlutterFeatureHost()

    let engine = FlutterEngine(name: "poppang.flutter")

    func start() {
        engine.run()
        GeneratedPluginRegistrant.register(with: engine)
    }

    func makeViewController() -> FlutterViewController {
        FlutterViewController(engine: engine, nibName: nil, bundle: nil)
    }
}
```

앱 시작 시 한 번만 `start()`를 호출해요.

```swift
FlutterFeatureHost.shared.start()
```

화면을 열 때는 `FlutterViewController`를 만들어 push하거나 present하면 돼요.

```swift
let vc = FlutterFeatureHost.shared.makeViewController()
navigationController?.pushViewController(vc, animated: true)
```

호스트 앱에서 `featureId`, `session.userUuid` 같은 컨텍스트를 Flutter에 넘겨야 한다면 `MethodChannel`이나 Pigeon을 함께 설계하세요.

### 기본 세팅이 맞는 상황

- 로컬 개발 속도가 가장 중요해요
- 지금 바로 Flutter 화면을 붙여야 해요
- iOS 앱과 Flutter 모듈을 같은 작업 폴더에서 함께 관리해요
- 배포 산출물보다 개발 편의가 더 중요해요

## 3. 모듈화 세팅 방법

이 경로는 Flutter 모듈을 버전 있는 의존성처럼 다루는 흐름이에요. 빌드 산출물을 만들고, Xcode가 그 산출물을 소비하게 만들고, 나중에는 zip이나 GitHub Release asset으로 배포할 수 있게 정리해요.

### 형제 폴더 구조를 기준으로 잡기

Flutter 공식 문서는 iOS 앱과 Flutter 앱 또는 모듈이 형제 폴더에 있다고 가정해요. 팝팡 팀도 이 구조를 쓰는 편이 가장 안전해요.

```text
PopPang/
├─ PopPang-iOS/
└─ PopPang-Flutter/
```

상대 경로가 이 기준에서 잡히기 때문에, 다른 구조를 쓰면 Xcode 설정과 스크립트 경로를 직접 다시 맞춰야 해요.

### Swift Package 산출물 만들기

`PopPang-Flutter`에서 아래 명령을 실행해요.

```bash
cd PopPang-Flutter
flutter pub get
flutter build swift-package --platform ios
```

기본 출력 경로는 아래예요.

```text
PopPang-Flutter/build/ios/SwiftPackages/
├─ FlutterNativeIntegration/
└─ Scripts/
```

출력 경로를 바꾸고 싶다면 `--output` 플래그를 함께 써도 돼요.

```bash
flutter build swift-package --platform ios --output dist/ios/SwiftPackages
```

### Xcode에 `FlutterNativeIntegration` 추가하기

`PopPang-iOS` 프로젝트에서는 아래 순서로 연결해요.

1. Xcode에서 기존 iOS 프로젝트를 열어요.
2. 프로젝트를 우클릭하고 `Add Files to ...`를 눌러요.
3. 생성된 `FlutterNativeIntegration` 디렉터리를 선택해요.
4. `Reference files in place`를 선택하고 추가해요.
5. File inspector에서 `Location`이 `Relative to Project`인지 확인해요.
6. 타깃의 `Frameworks, Libraries, and Embedded Content`에 `FlutterNativeIntegration`을 추가해요.

`Reference files in place`로 넣지 않으면 산출물 위치가 고정되지 않고, 형제 폴더 구조의 장점도 사라져요.

### Build Settings 추가하기

기본 설정은 아래처럼 맞춰요.

```text
FLUTTER_SWIFT_PACKAGE_OUTPUT=$SRCROOT/../PopPang-Flutter/build/ios/SwiftPackages
```

출력 경로를 `dist/ios/SwiftPackages`로 바꿨다면 그 경로로 맞춰야 해요.

커스텀 빌드 설정 이름을 쓴다면 `FLUTTER_BUILD_MODE`도 함께 넣어요.

```text
FLUTTER_BUILD_MODE=Debug
```

Xcode가 Flutter 코드를 다시 빌드하게 하려면 아래 설정도 추가해요.

```text
FLUTTER_APPLICATION_PATH=$SRCROOT/../PopPang-Flutter
ENABLE_USER_SCRIPT_SANDBOXING=NO
```

이 설정은 Flutter 코드 변경을 Xcode 빌드에 연결해 줘요. 다만 Flutter 의존성을 새로 추가했다면 이 자동 재빌드만으로는 부족하고, `flutter build swift-package`를 다시 실행해야 해요.

### Scheme Pre-action과 Build Phase 추가하기

Scheme의 Build > Pre-action에 아래 스크립트를 넣어요.

```bash
/bin/sh $FLUTTER_SWIFT_PACKAGE_OUTPUT/Scripts/flutter_integration.sh prebuild
```

타깃의 Build Phases에는 새 Run Script를 추가하고 아래 스크립트를 넣어요.

```bash
/bin/sh $FLUTTER_SWIFT_PACKAGE_OUTPUT/Scripts/flutter_integration.sh assemble
```

그리고 아래 두 가지도 같이 맞춰요.

- `Based on dependency analysis`는 꺼요
- `Input File Lists`에는 `$(FLUTTER_SWIFT_PACKAGE_OUTPUT)/Scripts/FlutterAssembleInputs.xcfilelist`를 넣어요

### 모듈화 세팅이 맞는 상황

- Flutter 산출물을 버전으로 관리하고 싶어요
- iOS 앱과 Flutter 모듈의 릴리즈 타이밍을 어느 정도 분리하고 싶어요
- GitHub Release asset이나 내부 배포 자산처럼 관리할 계획이 있어요
- 팀원이 같은 산출물을 반복해서 받아 쓰게 만들고 싶어요

## 4. 팝팡 팀 배포 방식

여기부터는 Flutter 공식 요구사항이 아니라, 팝팡 팀이 iOS 산출물을 버전 있는 의존성처럼 배포하기 위한 운영 방식이에요. 즉 이 섹션은 기본 세팅이 아니라 모듈화 세팅 위에 얹는 운영 가이드예요.

### 버전과 출력 경로 정하기

```bash
cd PopPang-Flutter

VERSION=0.1.0
OUTPUT_DIR=dist/ios/SwiftPackages
ARCHIVE_PATH=dist/ios/poppang-flutter-ios-v${VERSION}.zip
```

### 산출물 만들기

```bash
mkdir -p dist/ios
flutter pub get
flutter build swift-package --platform ios --output "$OUTPUT_DIR"
```

정상적으로 끝나면 아래 구조가 생겨요.

```text
dist/ios/SwiftPackages/
├─ FlutterNativeIntegration/
└─ Scripts/
```

확인만 빠르게 하고 싶다면 아래 명령을 써도 돼요.

```bash
find dist/ios/SwiftPackages -maxdepth 2 -type d
```

### zip으로 묶기

중요한 점은 `SwiftPackages` 폴더째 압축하지 않는 거예요. zip을 풀었을 때 바로 `FlutterNativeIntegration/`와 `Scripts/`가 보여야 해요.

```bash
cd "$OUTPUT_DIR"
zip -r "../poppang-flutter-ios-v${VERSION}.zip" FlutterNativeIntegration Scripts
cd ../../..
```

압축 결과는 보통 아래 경로에 생겨요.

```text
dist/ios/poppang-flutter-ios-v0.1.0.zip
```

압축이 잘됐는지는 아래 명령으로 확인해요.

```bash
unzip -l "$ARCHIVE_PATH"
```

여기서 `SwiftPackages/FlutterNativeIntegration/...`처럼 한 단계 더 들어가 보이면 압축 위치를 잘못 잡은 거예요.

### Git tag와 GitHub Release 올리기

릴리즈 산출물은 tag 기준으로 묶는 편이 관리하기 쉬워요.

```bash
VERSION=0.1.0
ARCHIVE_PATH=dist/ios/poppang-flutter-ios-v0.1.0.zip

git tag -a "v${VERSION}" -m "Release v${VERSION}"
git push origin "v${VERSION}"
```

그다음 GitHub Release를 만들고 zip을 asset으로 올려요.

```bash
gh release create "v${VERSION}" "$ARCHIVE_PATH" \
  --title "v${VERSION}" \
  --notes "PopPang Flutter iOS Swift Package artifact v${VERSION}" \
  --verify-tag
```

이렇게 올려두면 `PopPang-iOS`는 릴리즈 zip만 받아서 고정 경로에 풀어 쓰면 돼요.

```text
PopPang-iOS/
├─ Vendor/
│  └─ PopPangFlutter/
│     ├─ FlutterNativeIntegration/
│     └─ Scripts/
```

```bash
unzip poppang-flutter-ios-v0.1.0.zip -d Vendor/PopPangFlutter
```

버전을 기록하고 싶다면 아래처럼 버전 파일을 같이 두는 편이 좋아요.

```text
PopPang-iOS/
├─ .flutter-module-version
├─ scripts/
│  └─ fetch_poppang_flutter_ios.sh
└─ Vendor/
   └─ PopPangFlutter/
```

## 자주 막히는 지점

- 기본 세팅과 모듈화 세팅을 한 번에 같이 하려고 하면 경로와 스크립트가 자꾸 꼬여요.
- 로컬에서 바로 붙여 개발만 하려면 기본 세팅만 먼저 해도 충분해요.
- `Reference files in place`를 안 선택하면 경로가 복사돼서 이후 업데이트가 꼬여요.
- 형제 폴더 구조가 아니면 `FLUTTER_SWIFT_PACKAGE_OUTPUT`와 `FLUTTER_APPLICATION_PATH` 상대 경로가 바로 깨져요.
- 커스텀 빌드 설정을 쓰는데 `FLUTTER_BUILD_MODE`를 안 넣으면 빌드 모드 판단이 어긋날 수 있어요.
- 플러그인이나 의존성을 추가한 뒤 `flutter build swift-package`를 다시 안 돌리면 산출물이 오래된 상태로 남아요.
- `GeneratedPluginRegistrant.register(with:)`를 빼면 iOS 플랫폼 코드를 가진 플러그인이 동작하지 않을 수 있어요.
- zip을 만들 때 `SwiftPackages` 폴더를 통째로 압축하면 소비하는 쪽 경로가 한 단계 더 깊어져요.

## 공식 문서

- [Flutter Add-to-App 개요](https://docs.flutter.dev/add-to-app)
- [iOS 프로젝트 연결하기](https://docs.flutter.dev/add-to-app/ios/project-setup)
- [iOS에서 Flutter 화면 열기](https://docs.flutter.dev/add-to-app/ios/add-flutter-screen)

## 이어서 보면 좋아요

- Android와 iOS를 함께 다루는 큰 흐름은 [Android와 iOS에서 호출하는 Flutter 모듈 만들기](./flutter-add-to-app)에서 볼 수 있어요.
- Flutter 자체가 아직 익숙하지 않다면 [Flutter로 첫 모바일 앱 실행하기](./flutter-first-app)부터 먼저 보는 편이 좋아요.
