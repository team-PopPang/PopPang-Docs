---
title: Android와 iOS에서 호출하는 Flutter 모듈 만들기
description: Flutter 모듈을 만든 뒤 Android와 iOS 프로젝트에 연결하고 각 플랫폼에서 Flutter 화면을 호출하는 방법을 정리한 가이드
---

# Android와 iOS에서 호출하는 Flutter 모듈 만들기

이 문서는 기존 Android 앱과 iOS 앱에서 함께 호출할 수 있는 Flutter 모듈을 만드는 방법을 정리해요. 팝팡 팀에서 네이티브 앱 안에 Flutter 화면을 붙일 때 바로 따라 쓸 수 있는 최소 흐름만 담았어요.

이 문서는 기존 네이티브 앱이 이미 있고, 그 안에 Flutter 기능 하나를 추가하려는 팀원을 위한 가이드예요. Flutter 앱을 처음부터 새로 만드는 방법보다, 모듈을 만들고 호스트 앱과 연결하는 데 집중해요.

문서를 마치면 아래 작업을 할 수 있어요.

- `flutter create -t module`로 Flutter 모듈 만들기
- Android와 iOS 프로젝트에 Flutter 모듈 연결하기
- `MethodChannel`로 호스트 앱과 Flutter 모듈이 값을 주고받게 만들기
- Android와 iOS에서 Flutter 화면 호출하기

## 준비할 것

- Flutter SDK
- Android Studio
- Xcode
- 기존 Android 프로젝트
- 기존 iOS 프로젝트
- macOS

iOS 통합까지 테스트하려면 macOS가 필요해요.

## 1. Flutter 모듈 만들기

가장 먼저 Flutter 모듈을 만들어요.

```bash
flutter create -t module flutter_module
```

팀에서 Android 프로젝트와 iOS 프로젝트를 따로 관리한다면, 아래처럼 같은 상위 폴더에 두는 편이 관리하기 쉬워요.

```text
workspace/
  android-host/
  ios-host/
  flutter_module/
```

`flutter_module` 안에는 Flutter 화면을 만드는 `lib/`와 네이티브 연결에 필요한 `.android/`, `.ios/` 폴더가 함께 생겨요. 이후 단계는 이 모듈을 두 호스트 앱에 각각 연결하는 작업이에요.

## 2. Flutter 쪽 도킹 인터페이스 만들기

호스트 앱과 Flutter 모듈이 값을 주고받으려면 공통 인터페이스가 필요해요. 가장 단순한 방법은 `MethodChannel`을 하나 정해두고, 호스트 앱이 값을 돌려주게 만드는 거예요.

이 예제에서는 아래 규칙을 쓸게요.

- channel 이름: `com.poppang.flutter_module/host`
- method 이름: `getHostInfo`

`flutter_module/lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  runApp(const ModuleApp());
}

class ModuleApp extends StatelessWidget {
  const ModuleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Module Demo',
      routes: {
        '/': (_) => const ModuleDemoPage(),
        '/module-demo': (_) => const ModuleDemoPage(),
      },
    );
  }
}

class HostBridge {
  static const MethodChannel _channel = MethodChannel(
    'com.poppang.flutter_module/host',
  );

  static Future<String> getHostInfo() async {
    final value = await _channel.invokeMethod<String>('getHostInfo');
    return value ?? 'host info is empty';
  }
}

class ModuleDemoPage extends StatefulWidget {
  const ModuleDemoPage({super.key});

  @override
  State<ModuleDemoPage> createState() => _ModuleDemoPageState();
}

class _ModuleDemoPageState extends State<ModuleDemoPage> {
  String message = '아직 호스트 앱과 연결하지 않았어요.';

  Future<void> loadHostInfo() async {
    try {
      final value = await HostBridge.getHostInfo();
      setState(() {
        message = value;
      });
    } on PlatformException catch (error) {
      setState(() {
        message = '호스트 호출에 실패했어요: ${error.message}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter Module Demo'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              '호스트 앱과 Flutter 모듈 연결 확인',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(message),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: loadHostInfo,
              child: const Text('호스트 정보 불러오기'),
            ),
          ],
        ),
      ),
    );
  }
}
```

이 화면이 뜬 뒤 버튼을 눌렀을 때 Android나 iOS 쪽 문자열이 보이면 연결이 된 거예요.

## 3. Android 프로젝트에 연결하기

이 방식은 Flutter 모듈 source code에 직접 의존해요. 그래서 Android 호스트 앱을 빌드하는 팀원도 Flutter SDK를 설치해야 해요.

### `settings.gradle.kts`에 Flutter 모듈 추가하기

Android 호스트 앱에서 Flutter 모듈을 서브프로젝트로 불러와요.

`android-host/settings.gradle.kts`

```kotlin
include(":app")

val flutterModulePath =
    settingsDir.parentFile.toString() + "/flutter_module/.android/include_flutter.groovy"
apply(from = File(flutterModulePath))
```

Kotlin DSL에서 이 방식을 쓰려면 Flutter 3.27 이상이 필요해요. 버전이 낮다면 Flutter를 먼저 업데이트하세요.

### 앱 모듈에 Flutter 의존성 추가하기

`android-host/app/build.gradle.kts`

```kotlin
dependencies {
    implementation(project(":flutter"))
}
```

Gradle Sync가 끝나면 Android 프로젝트가 Flutter 모듈을 함께 빌드할 수 있어요.

### `FlutterEngine`을 미리 만들고 채널 연결하기

가장 단순한 화면 호출 방식은 `FlutterActivity`를 쓰는 거예요. 실행 지연을 줄이려면 `Application`에서 `FlutterEngine`을 미리 만들어 두는 편이 좋아요.

`android-host/app/src/main/java/.../MyApplication.kt`

```kotlin
import android.app.Application
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.embedding.engine.FlutterEngineCache
import io.flutter.embedding.engine.dart.DartExecutor
import io.flutter.plugin.common.MethodChannel

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        val flutterEngine = FlutterEngine(this)

        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "com.poppang.flutter_module/host",
        ).setMethodCallHandler { call, result ->
            when (call.method) {
                "getHostInfo" -> result.success("Android host: ${packageName}")
                else -> result.notImplemented()
            }
        }

        flutterEngine.dartExecutor.executeDartEntrypoint(
            DartExecutor.DartEntrypoint.createDefault(),
        )

        FlutterEngineCache.getInstance().put("poppang_flutter_engine", flutterEngine)
    }
}
```

`AndroidManifest.xml`에서 `application` 이름도 연결해야 해요.

```xml
<application
    android:name=".MyApplication"
    ... />
```

### Android에서 Flutter 화면 호출하기

버튼 클릭이나 화면 전환 지점에서 `FlutterActivity`를 열면 돼요.

`android-host/app/src/main/java/.../HomeActivity.kt`

```kotlin
import androidx.appcompat.app.AppCompatActivity
import io.flutter.embedding.android.FlutterActivity

class HomeActivity : AppCompatActivity() {
    fun openFlutterModule() {
        startActivity(
            FlutterActivity
                .withCachedEngine("poppang_flutter_engine")
                .build(this),
        )
    }
}
```

화면 일부에만 Flutter를 넣고 싶다면 `FlutterFragment`를 검토하세요. `FlutterView`는 더 고급 통합 방식이라 처음에는 권장하지 않아요.

## 4. iOS 프로젝트에 연결하기

### Swift Package 생성하기

iOS 쪽은 Flutter 모듈에서 Swift Package를 먼저 만들어요.

```bash
cd flutter_module
flutter build swift-package --platform ios
```

이 명령을 실행하면 `build/ios/SwiftPackages/FlutterNativeIntegration`이 생겨요.

### Xcode에 Flutter 패키지 추가하기

기존 iOS 앱에서 아래 순서로 추가해요.

1. Xcode에서 기존 iOS 프로젝트를 열어요.
2. 프로젝트를 우클릭한 뒤 `Add Files to ...`를 눌러요.
3. `flutter_module/build/ios/SwiftPackages/FlutterNativeIntegration`을 선택해요.
4. `Reference files in place`로 추가해요.

Flutter 모듈과 iOS 프로젝트가 형제 폴더가 아니면 상대 경로가 깨질 수 있어요. 이 구조는 처음부터 맞춰두는 편이 안전해요.

### `AppDelegate`에서 엔진과 채널 준비하기

`ios-host/AppDelegate.swift`

```swift
import UIKit
import Flutter
import FlutterPluginRegistrant

@main
class AppDelegate: FlutterAppDelegate {
    lazy var flutterEngine = FlutterEngine(name: "poppang_flutter_engine")

    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        flutterEngine.run()
        GeneratedPluginRegistrant.register(with: flutterEngine)

        let hostChannel = FlutterMethodChannel(
            name: "com.poppang.flutter_module/host",
            binaryMessenger: flutterEngine.binaryMessenger
        )

        hostChannel.setMethodCallHandler { call, result in
            switch call.method {
            case "getHostInfo":
                result("iOS host: \(Bundle.main.bundleIdentifier ?? "unknown")")
            default:
                result(FlutterMethodNotImplemented)
            }
        }

        return super.application(
            application,
            didFinishLaunchingWithOptions: launchOptions
        )
    }
}
```

### iOS에서 Flutter 화면 호출하기

원하는 `UIViewController`에서 `FlutterViewController`를 띄우면 돼요.

`ios-host/HomeViewController.swift`

```swift
import UIKit
import Flutter

final class HomeViewController: UIViewController {
    func openFlutterModule() {
        guard let appDelegate = UIApplication.shared.delegate as? AppDelegate else {
            return
        }

        let flutterViewController = FlutterViewController(
            engine: appDelegate.flutterEngine,
            nibName: nil,
            bundle: nil
        )

        present(flutterViewController, animated: true)
    }
}
```

SwiftUI 앱이라면 `UIViewControllerRepresentable`로 감싸서 같은 `FlutterViewController`를 화면에 올리면 돼요.

## 5. 특정 Flutter 화면을 바로 열고 싶을 때

위 예제는 기본 Flutter 화면을 여는 가장 단순한 흐름이에요. 특정 화면을 바로 열고 싶다면 라우트를 정해두고 엔진을 실행하기 전에 `initialRoute`를 설정하세요.

Android에서는 Dart entrypoint를 실행하기 전에 설정해요.

```kotlin
flutterEngine.navigationChannel.setInitialRoute("/module-demo")
flutterEngine.dartExecutor.executeDartEntrypoint(
    DartExecutor.DartEntrypoint.createDefault(),
)
```

iOS에서는 `flutterEngine.run()` 전에 설정해요.

```swift
flutterEngine.navigationChannel.setInitialRoute("/module-demo")
flutterEngine.run()
```

Flutter 쪽에서는 그 라우트를 받아 처리할 수 있게 `routes`를 미리 등록해 두면 돼요.

캐시한 엔진 하나를 계속 재사용할 때는 `initialRoute`를 실행 전에 한 번만 정할 수 있어요. 열 때마다 다른 화면이 필요하다면 Flutter 내부 내비게이션으로 분기하거나, 화면별 엔진 전략을 따로 정하는 편이 안전해요.

## 자주 빠지는 것

- Android, iOS, Flutter 세 곳의 channel 이름이 모두 같아야 해요.
- iOS에서 `GeneratedPluginRegistrant.register(with:)`를 빼면 플러그인이 동작하지 않을 수 있어요.
- Android에서 캐시한 엔진을 쓸 때는 Dart 코드가 화면을 열기 전부터 실행돼요.
- iOS에서 Flutter 의존성이나 플러그인을 바꿨다면 `flutter build swift-package --platform ios`를 다시 실행해야 해요.
- Android에서 화면 일부만 붙이고 싶더라도 처음에는 `FlutterActivity`나 `FlutterFragment`로 시작하는 편이 안전해요.

## 공식 문서

- [Flutter Add-to-App 개요](https://docs.flutter.dev/add-to-app)
- [Android 프로젝트 연결하기](https://docs.flutter.dev/add-to-app/android/project-setup)
- [Android에서 Flutter 화면 열기](https://docs.flutter.dev/add-to-app/android/add-flutter-screen)
- [Android에서 FlutterFragment 쓰기](https://docs.flutter.dev/add-to-app/android/add-flutter-fragment)
- [iOS 프로젝트 연결하기](https://docs.flutter.dev/add-to-app/ios/project-setup)
- [iOS에서 Flutter 화면 열기](https://docs.flutter.dev/add-to-app/ios/add-flutter-screen)
- [Platform Channels](https://docs.flutter.dev/platform-integration/platform-channels)

## 이어서 보면 좋아요

Flutter 자체가 아직 익숙하지 않다면 [Flutter로 첫 모바일 앱 실행하기](./flutter-first-app)부터 먼저 보는 편이 좋아요.
