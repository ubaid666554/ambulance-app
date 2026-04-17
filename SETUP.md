# Complete React Native Setup Guide (Windows)

A full end-to-end guide for setting up a React Native development environment on Windows from scratch.

---

## 1. Mandatory Software to Install

| Tool | Purpose | Download |
|------|---------|----------|
| **Node.js (LTS)** | Runs JavaScript, npm package manager | https://nodejs.org |
| **JDK 17** (Adoptium/Temurin) | Required to compile Android apps | https://adoptium.net |
| **Android Studio** | Provides Android SDK, emulator, build tools | https://developer.android.com/studio |
| **Git** | Version control | https://git-scm.com |
| **VS Code** (optional) | Code editor | https://code.visualstudio.com |

---

## 2. Android Studio — SDK Components

After installing Android Studio, open **SDK Manager** and install:

- **Android SDK Platform** (API 36 — or whichever version matches `compileSdkVersion` in `android/build.gradle`)
- **Android SDK Build-Tools**
- **Android SDK Platform-Tools** (contains `adb`)
- **Android SDK Command-line Tools**
- **Android Emulator**
- **NDK (Side by side)** — needed for React Native native modules
- **CMake**

Then open **Device Manager** → Create Virtual Device (e.g., Pixel 6) → Download a system image → Finish.

---

## 3. Environment Variables (Windows)

Open: **Start → "Edit the system environment variables" → Environment Variables**

### User Variables — Add these:

| Variable | Value | Duty |
|----------|-------|------|
| `JAVA_HOME` | `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot` | Tells Gradle where Java compiler lives |
| `ANDROID_HOME` | `C:\Users\<You>\AppData\Local\Android\Sdk` | Tells React Native/Gradle where Android SDK lives |

### Path Variable — Add these entries:

| Path Entry | Duty |
|------------|------|
| `%JAVA_HOME%\bin` | Makes `java`, `javac` runnable from terminal |
| `%ANDROID_HOME%\platform-tools` | Makes `adb` runnable (connect/install devices) |
| `%ANDROID_HOME%\emulator` | Makes `emulator` command runnable |
| `%ANDROID_HOME%\cmdline-tools\latest\bin` | Makes `sdkmanager`, `avdmanager` runnable |

**Restart terminal after changes.**

---

## 4. Verify Installation

Run in a **new** terminal:

```bash
node -v          # should print v20.x or v18.x
npm -v           # package manager
java -version    # should print 17.x
adb --version    # confirms ANDROID_HOME/path
emulator -list-avds   # lists your virtual devices
```

If any fail → the related variable/path is wrong.

---

## 5. Create a New React Native Project

```bash
npx @react-native-community/cli init MyApp
cd MyApp
```

This scaffolds: `android/`, `ios/`, `App.tsx`, `package.json`, etc.

---

## 6. Run the App

### Option A — Emulator
1. Open Android Studio → Device Manager → Start emulator
2. In project folder: `npx react-native run-android`

### Option B — Physical device
1. Enable **Developer Options** on phone (tap Build Number 7×)
2. Enable **USB Debugging**
3. Connect via USB, accept the RSA prompt
4. Verify: `adb devices` shows your phone
5. Run: `npx react-native run-android`

---

## 7. Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Trailing char < > at index N` | Space in `local.properties` SDK path | Remove trailing whitespace in `android/local.properties` |
| `SDK location not found` | `ANDROID_HOME` not set | Set env variable, restart terminal |
| `Failed to launch emulator` | No AVD created | Create one in Device Manager |
| `JAVA_HOME not set` | Missing env var | Set to JDK 17 path |
| `Unable to load script` | Metro bundler not running | Run `npx react-native start` in a separate terminal |
| SDK XML version 4 warning | Outdated cmdline-tools | Update in SDK Manager |

---

## 8. What Each Tool Actually Does

- **Node.js** — Runs the JS bundler (Metro) and npm scripts
- **npm / yarn** — Installs React Native and all JS dependencies into `node_modules`
- **Metro** — Bundles JS code and serves it to the app on port **8081**
- **JDK** — Compiles Java/Kotlin source in `android/` into `.class` files
- **Gradle** — Build system that orchestrates Android compilation (uses `android/gradlew`)
- **Android SDK** — Provides Android APIs, build tools, and platform libraries
- **ADB (Android Debug Bridge)** — Communicates with emulator/device (install APK, logs)
- **Emulator** — Runs a virtual Android device on your PC
- **NDK** — Compiles native C/C++ code (used by some RN libraries)

---

## 9. Useful Commands Cheatsheet

```bash
npx react-native start            # Start Metro bundler
npx react-native run-android      # Build + install + run on Android
npx react-native run-ios          # Mac only — run on iOS simulator
adb devices                       # List connected devices
adb logcat *:S ReactNative:V ReactNativeJS:V   # View app logs
cd android && gradlew clean       # Clean Android build cache
npm start -- --reset-cache        # Reset Metro cache
```

---

## 10. Quick Setup Checklist

- [ ] Installed Node.js LTS
- [ ] Installed JDK 17
- [ ] Installed Android Studio + SDK components
- [ ] Created AVD (emulator) in Device Manager
- [ ] Set `JAVA_HOME` and `ANDROID_HOME` environment variables
- [ ] Added required entries to `Path`
- [ ] Verified with `node -v`, `java -version`, `adb --version`
- [ ] Ran `npx react-native run-android` successfully
