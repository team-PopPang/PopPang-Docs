---
title: 기존 iOS 앱에 PopPang-RN 넣기
description: 기존 iOS 프로젝트에서 PopPang-RN 릴리즈 버전을 확인하고 SPM 프레임워크와 JavaScript bundle을 내려받아 Xcode와 Swift 화면 호출을 설정하는 방법
---

# 기존 iOS 앱에 PopPang-RN 넣기

기존 iOS 앱에 팝업 요청 기능을 넣는 방법이에요. 호스트 앱에 PopPang-RN 저장소나 `node_modules`, CocoaPods를 추가하지 않아도 돼요. **같은 릴리즈의 SPM 프레임워크와 JavaScript bundle을 내려받아** Xcode 프로젝트에 넣고, Swift에서 PopPang-RN 화면을 열면 돼요.

이 문서는 이미 존재하는 iOS 프로젝트에 넣는 과정을 다뤄요. PopPang-RN 데모 앱을 직접 실행하려면 [첫 모바일 앱 실행하기](./react-native-first-app.md)를 참고하세요.

원문: [PopPang-RN README의 iOS 클라이언트 앱 가이드](https://github.com/team-PopPang/PopPang-RN#클라이언트-앱ios)

## 완료하면 이렇게 구성돼요

```text
HostProject/
├── scripts/
│   └── download-rn-release.sh
└── PopPangBrownField/
    ├── Resources/ReactNative/
    │   ├── main.jsbundle                 # 릴리즈의 JavaScript bundle
    │   └── assets/                        # bundle이 참조하는 이미지 등의 리소스
    └── Vendor/PrebuiltReactNativeFrameworks/
                                            # 로컬 Swift Package
```

`PopPangBrownField`는 이 문서에서 사용하는 예시 디렉터리명이에요. 기존 프로젝트의 구조에 맞춰 이름을 바꿔도 되지만, 이후 Xcode의 bundle 경로와 SPM 경로도 함께 바꿔야 해요.

## 준비할 것

- macOS와 Xcode
- iOS 앱 타깃을 수정할 권한
- GitHub 릴리즈를 받기 위한 [GitHub CLI](https://cli.github.com/)와 로그인 상태
- `unzip`, `ditto` 명령

GitHub CLI를 처음 사용한다면 아래 명령으로 로그인하세요.

```bash
gh auth login
```

## 1. 설치할 릴리즈 버전을 확인해요

먼저 배포된 버전 목록과 파일을 확인하세요. 프레임워크와 JavaScript bundle은 반드시 **같은 태그**를 선택해야 해요.

```bash
gh release list --repo team-PopPang/PopPang-RN

# 목록에서 선택한 태그의 파일을 확인해요.
VERSION=v0.1.0
gh release view "$VERSION" --repo team-PopPang/PopPang-RN
```

`VERSION=v0.1.0`은 예시예요. 릴리즈 목록에서 실제로 도입할 태그를 고르세요.

iOS에 필요한 파일은 아래 두 개예요.

| 파일                               | 용도                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `poppang-rn-spm-<태그>.zip`        | React Native 런타임과 PopPang 호스트 모듈이 들어 있는 로컬 Swift Package예요. |
| `poppang-rn-ios-bundle-<태그>.zip` | 릴리즈 빌드가 실행할 `main.jsbundle`과 리소스예요.                            |

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

BUNDLE_ASSET="poppang-rn-ios-bundle-$VERSION.zip"
SPM_ASSET="poppang-rn-spm-$VERSION.zip"

gh release download "$VERSION" --repo "$REPO" \
  --pattern "$BUNDLE_ASSET" --dir "$TMP_DIR" --clobber
gh release download "$VERSION" --repo "$REPO" \
  --pattern "$SPM_ASSET" --dir "$TMP_DIR" --clobber

rm -rf "$ROOT_DIR/PopPangBrownField/Resources/ReactNative"
rm -rf "$ROOT_DIR/PopPangBrownField/Vendor/PrebuiltReactNativeFrameworks"
mkdir -p "$ROOT_DIR/PopPangBrownField/Resources/ReactNative"
mkdir -p "$ROOT_DIR/PopPangBrownField/Vendor"

unzip -q "$TMP_DIR/$BUNDLE_ASSET" -d "$TMP_DIR/bundle"
unzip -q "$TMP_DIR/$SPM_ASSET" -d "$TMP_DIR/frameworks"

cp "$TMP_DIR/bundle/ios/main.jsbundle" \
  "$ROOT_DIR/PopPangBrownField/Resources/ReactNative/main.jsbundle"
if [ -d "$TMP_DIR/bundle/ios/assets" ]; then
  cp -R "$TMP_DIR/bundle/ios/assets" \
    "$ROOT_DIR/PopPangBrownField/Resources/ReactNative/assets"
fi
ditto "$TMP_DIR/frameworks/PrebuiltReactNativeFrameworks" \
  "$ROOT_DIR/PopPangBrownField/Vendor/PrebuiltReactNativeFrameworks"
```

실행 권한을 주고 실행하세요.

```bash
chmod +x scripts/download-rn-release.sh
./scripts/download-rn-release.sh v0.1.0
```

프레임워크 ZIP만 바꾸거나 bundle ZIP만 바꾸면 네이티브 코드와 JavaScript 코드가 서로 다른 버전이 될 수 있어요. 릴리즈를 올릴 때는 항상 두 파일을 같은 태그로 다시 내려받으세요.

### 내려받은 파일을 어디에서 관리할지 정해요

`PrebuiltReactNativeFrameworks`에는 사전 빌드된 프레임워크가 있어 용량이 클 수 있어요. 팀의 빌드 환경에 맞춰 다음 중 하나를 정하세요.

- 사내 소스 저장소 또는 Git LFS로 파일을 함께 관리해요.
- 개발 환경과 CI에서 위 스크립트를 실행해 내려받아요.

어떤 방식이든 Xcode가 빌드할 때 `main.jsbundle`, `assets`, `PrebuiltReactNativeFrameworks`가 모두 있어야 해요.

## 3. Xcode에 로컬 Swift Package를 추가해요

Xcode에서 호스트 앱 프로젝트를 연 뒤 아래 순서로 진행하세요.

1. **File > Add Package Dependencies…**를 선택해요.
2. **Add Local…**을 선택해 `PopPangBrownField/Vendor/PrebuiltReactNativeFrameworks` 폴더를 고르세요.
3. 패키지를 호스트 앱 타깃에 연결하세요.
4. Xcode의 Package Dependencies 목록에 패키지가 보이는지 확인하세요.

이 패키지에는 PopPang React Native 호스트 모듈과 필요한 사전 빌드 프레임워크가 포함돼 있어요. 호스트 앱에서 별도로 React Native Pod를 설치하거나 Podfile을 수정할 필요는 없어요.

## 4. bundle과 assets를 앱 리소스로 복사해요

`PopPangBrownField/Resources/ReactNative` 폴더 전체를 Xcode 프로젝트에 추가하세요.

1. Project Navigator에서 앱 리소스를 둘 그룹을 선택한 뒤 **Add Files to …**를 선택해요.
2. `Resources/ReactNative`를 선택하고 **Create folder references**를 선택하세요. 폴더가 파란색으로 보이면 정상이에요.
3. 호스트 앱 타깃을 선택해 추가하세요.
4. 타깃의 **Build Phases > Copy Bundle Resources**에 `ReactNative` 폴더 참조가 포함됐는지 확인하세요.

`main.jsbundle` 파일만 추가하면 bundle 안에서 상대 경로로 찾는 이미지와 리소스가 누락될 수 있어요. 반드시 `assets`를 포함한 폴더 전체를 유지하세요. 폴더 참조 대신 일반 그룹으로 추가했다면 배포 앱의 bundle 안에서도 `ReactNative/main.jsbundle`과 `ReactNative/assets` 구조가 유지되는지 확인해야 해요.

## 5. Release 빌드가 로컬 bundle을 읽도록 설정해요

PopPang-RN의 네이티브 진입점 이름은 `PopPangRNRoot`예요. React Native 팩토리를 구성하는 코드에서 이 이름을 정확히 사용하고, Release에서는 방금 넣은 bundle을 읽도록 설정하세요.

아래는 UIKit 호스트에서 사용할 수 있는 최소 구성 예시예요. 이미 React Native 팩토리나 앱 공용 의존성 주입 구조가 있다면 그 구조 안에 같은 설정을 넣으세요.

```swift
import React
import React_RCTAppDelegate

final class PopPangRNFactoryDelegate: RCTDefaultReactNativeFactoryDelegate {
    override func sourceURL(for bridge: RCTBridge) -> URL? {
        return bundleURL()
    }

    override func bundleURL() -> URL? {
        #if DEBUG
        return RCTBundleURLProvider.sharedSettings()
            .jsBundleURL(forBundleRoot: "index")
        #else
        return Bundle.main.url(
            forResource: "main",
            withExtension: "jsbundle",
            subdirectory: "ReactNative"
        )
        #endif
    }
}
```

- **Debug**는 Metro의 `index.js`를 읽어 PopPang-RN 데모 화면을 보여줘요.
- **Release**는 앱에 포함한 `ReactNative/main.jsbundle`을 읽고, 전달한 `feature` 화면을 보여줘요.

호스트 프로젝트에서 bundle의 실제 위치가 `ReactNative`가 아니라면 `subdirectory`도 그 경로에 맞춰 바꾸세요.

## 6. Swift에서 PopPang-RN 화면을 만들어요

팩토리와 delegate는 화면이 표시되는 동안 메모리에 유지돼야 해요. 아래처럼 `UIViewController`가 두 객체를 프로퍼티로 보관하도록 만드세요.

```swift
import UIKit
import React_RCTAppDelegate
import ReactAppDependencyProvider

final class PopPangRNViewController: UIViewController {
    private let initialProperties: [String: Any]
    private var factory: RCTReactNativeFactory?
    private var factoryDelegate: PopPangRNFactoryDelegate?

    init(initialProperties: [String: Any]) {
        self.initialProperties = initialProperties
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        let delegate = PopPangRNFactoryDelegate()
        delegate.dependencyProvider = RCTAppDependencyProvider()
        let factory = RCTReactNativeFactory(delegate: delegate)

        factoryDelegate = delegate
        self.factory = factory
        view = factory.rootViewFactory.view(
            withModuleName: "PopPangRNRoot",
            initialProperties: initialProperties
        )
    }
}
```

SwiftUI 앱에서는 아래 wrapper를 같은 파일에 추가해요. 이벤트 핸들러를 화면 생성 시 등록하고 화면이 사라질 때 해제하므로, 이전 화면이 새 화면의 이벤트를 받는 일을 막을 수 있어요.

```swift
import SwiftUI
import PopPangReactNativeHost

struct ReactNativeScreen: UIViewControllerRepresentable {
    let initialProperties: [String: Any]
    let onNativeEvent: ((String) -> Void)?

    func makeUIViewController(context: Context) -> PopPangRNViewController {
        PopPangHostAction.setEventHandler(onNativeEvent)
        return PopPangRNViewController(initialProperties: initialProperties)
    }

    func updateUIViewController(
        _ uiViewController: PopPangRNViewController,
        context: Context
    ) {
        PopPangHostAction.setEventHandler(onNativeEvent)
    }

    static func dismantleUIViewController(
        _ uiViewController: PopPangRNViewController,
        coordinator: ()
    ) {
        PopPangHostAction.setEventHandler(nil)
    }
}
```

이 wrapper는 한 번에 PopPang-RN 화면 하나를 표시하는 일반적인 흐름을 위한 예시예요. 여러 PopPang-RN 화면을 동시에 표시할 수 있는 구조라면, 화면별 coordinator ID를 두어 현재 표시 중인 화면만 핸들러를 해제하도록 구성하세요.

UIKit 앱이라면 `PopPangRNViewController`를 일반적인 `present` 또는 navigation push 방식으로 표시하고, `viewDidDisappear` 등에서 `PopPangHostAction.setEventHandler(nil)`을 호출해 같은 수명 주기를 보장하세요.

## 7. 기능, 사용자 UUID, 네이티브 이벤트를 전달해요

화면을 만들 때 `feature`와 로그인한 사용자의 `userUuid`를 반드시 전달하세요. `nativeEvents`는 호스트 앱이 받을 이벤트만 넣어요.

```swift
struct PopupRequestEntry: View {
    let userUuid: String
    @State private var isPresented = false

    var body: some View {
        Button("팝업 제보하기") {
            isPresented = true
        }
        .fullScreenCover(isPresented: $isPresented) {
            ReactNativeScreen(
                initialProperties: [
                    "feature": "request",
                    "userUuid": userUuid,
                    "nativeEvents": [
                        "popupRequestSubmitted",
                        "popupRequestBack",
                    ],
                ],
                onNativeEvent: { eventName in
                    switch eventName {
                    case "popupRequestSubmitted":
                        // 목록을 새로고침한 뒤 닫아요.
                        isPresented = false
                    case "popupRequestBack":
                        isPresented = false
                    default:
                        break
                    }
                }
            )
        }
    }
}
```

| 기능           | `feature` 값         | 용도                           | 지원 이벤트                                 |
| -------------- | -------------------- | ------------------------------ | ------------------------------------------- |
| 팝업 요청      | `request`            | 일반 사용자가 팝업을 요청해요. | `popupRequestSubmitted`, `popupRequestBack` |
| 팝업 요청 관리 | `request-management` | 관리자가 요청을 관리해요.      | `popupRequestManagementBack`                |

`userUuid`에는 로그인한 사용자의 실제 UUID를 넣으세요. `feature`를 생략하거나 오타를 내면 원하는 화면 대신 기본 루트가 열릴 수 있어요.

위 코드의 `onNativeEvent`가 `PopPangHostAction.setEventHandler`에 연결돼요. 팝업 요청 관리 화면에서는 `feature`를 `request-management`로, `nativeEvents`를 `popupRequestManagementBack`으로 바꾸고 이벤트를 받았을 때 navigation path를 하나 제거하면 돼요.

## 8. Metro 없이 Release 빌드로 확인해요

통합 결과는 Debug가 아니라 **Release 구성**에서 확인해야 해요. Metro를 종료한 상태에서 실제 기기 또는 Release Scheme으로 빌드해 아래를 점검하세요.

- 앱이 `ReactNative/main.jsbundle`을 읽어 PopPang 화면을 열어요.
- 로그인한 사용자의 UUID로 요청 화면이 열려요.
- 요청 등록 또는 뒤로 가기 이벤트가 호스트 앱에 도착해요.
- 이미지 등 `assets` 리소스가 빠지지 않고 보여요.

Release에서 `No bundle URL present` 또는 빈 화면이 나오면 다음을 확인하세요.

1. `main.jsbundle`이 앱 타깃의 Copy Bundle Resources에 포함됐는지 확인해요.
2. `Bundle.main.url`의 `subdirectory: "ReactNative"`가 실제 bundle 내부 경로와 같은지 확인해요.
3. Debug의 Metro URL이 아니라 Release의 로컬 bundle URL을 반환하는지 확인해요.

## 자주 막히는 지점

### `PrebuiltReactNativeFrameworks`를 찾지 못할 때

Xcode의 Package Dependencies에서 경로가 끊기지 않았는지 확인하세요. 스크립트를 다시 실행해 폴더를 통째로 교체한 경우, Xcode에서 로컬 패키지 참조를 새 경로로 다시 선택해야 할 수 있어요.

### bundle은 보이는데 이미지가 보이지 않을 때

`assets` 폴더를 포함하지 않았거나 폴더 구조가 바뀐 경우예요. `Resources/ReactNative` 전체를 폴더 참조로 추가하고 Copy Bundle Resources 설정을 다시 확인하세요.

### 호스트 앱에 CocoaPods를 설치해야 하는지 궁금할 때

그럴 필요 없어요. PopPang-RN은 SPM으로 전달되는 사전 빌드 프레임워크를 사용해요. 호스트 앱에는 이 문서의 로컬 Swift Package와 bundle 리소스만 추가하면 돼요.
