# 📱 do-time Mobile Application Guide

Welcome to the mobile journey for `do-time`! Since you have built a beautiful web application with Next.js and Tailwind, transitioning to mobile will allow you to bring that same premium experience to users' pockets.

Since you are new to mobile development, this guide will walk you through the best approaches and the steps required from setup to store deployment.

---

## 🛠️ 1. Framework Choice: Flutter vs. React Native

To build a mobile app for both Android and iOS without writing code twice, you have two excellent choices:

### Option A: React Native (Recommended for your background)
*   **Why**: It uses React and JavaScript/TypeScript. You can reuse your knowledge of hooks, component structure, and state management.
*   **Pros**: Familiar syntax, massive ecosystem, good for standard UI.
*   **Cons**: Bridging to native features can sometimes be complex.

### Option B: Flutter (Recommended for "WOW" aesthetics)
*   **Why**: It uses Dart (easy to learn for JS developers) and renders every pixel itself.
*   **Pros**: Extremely fast, identical UI on iOS and Android, best for custom designs, gradients, and rich animations.
*   **Cons**: You need to learn Dart and a new widget system.

---

## 📦 Installation (Linux)

To install Flutter directly from your terminal without browsing, follow these steps:

1.  **Create a development folder**:
    ```bash
    mkdir -p mobile/development
    ```
2.  **Download the Flutter SDK**:
    ```bash
    curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.41.6-stable.tar.xz
    ```
3.  **Extract the SDK**:
    ```bash
    tar xf flutter_linux_3.41.6-stable.tar.xz -C mobile/development
    ```
4.  **Add to PATH (Permanent)**:
    Run this command to add Flutter to your PATH permanently:
    ```bash
    echo 'export PATH="$PATH:$PWD/mobile/development/flutter/bin"' >> ~/.bashrc
    ```
    Then apply the changes to your current session:
    ```bash
    source ~/.bashrc
    ```
5.  **Verify**:
    ```bash
    flutter doctor
    ```

### 🛠️ Fixing Missing Dependencies

If `flutter doctor` reports missing tools, follow these steps:

**For Linux Toolchain (to test as a desktop app):**
```bash
sudo apt update && sudo apt install -y clang cmake ninja-build libgtk-3-dev
```

**For Android Toolchain (required for mobile):**
1.  Download and install **Android Studio** to get the Android SDK.
2.  Run the setup wizard in Android Studio.
3.  Accept Android licenses by running:
    ```bash
    flutter doctor --android-licenses
    ```

---

## 🚀 2. Step-by-Step Development Guide (Assuming Flutter)

*If you choose React Native, the setup is different but the concepts are similar.*

### Phase 1: Environment Setup
1.  **Install Flutter SDK**: Follow the commands in the **Installation** section above.
2.  **Install Android Studio**: Required for Android emulation and SDK tools.
3.  **Install Xcode** (Mac only): Required to build for iOS.
4.  **Run `flutter doctor`**: This command checks your setup and tells you what is missing.

### Phase 2: Creating the Project
Run the following command in your terminal (outside the `web` folder):
```bash
flutter create mobile_app
```

### Phase 3: Building the Core Features
You will recreate the modules we built in the web app:
*   **Themes**: Use Flutter's `ThemeData` or custom container gradients for Sunrise, Noon, Sunset, and Night.
*   **Pomodoro**: Use a `Timer` class in Dart to handle the countdown.
*   **World Clock**: Use packages like `timezone` to handle time calculations.
*   **Audio**: Use the `audioplayers` package to play your custom MP3 chimes.

---

## 📦 3. Deployment Guide

Deploying to mobile stores is more complex than deploying to Cloud Run. It requires accounts and review processes.

### 🤖 Android Play Store Deployment

1.  **Google Play Console Account**: Register at [play.google.com/console](https://play.google.com/console) (requires a one-time $25 fee).
2.  **Configure App Signing**: Generate an upload keystore (security key) using `keytool`.
3.  **Update Configuration**: Set your app's package name (e.g., `com.priyambodo.dotime`) and version in `pubspec.yaml` or `build.gradle`.
4.  **Build App Bundle**: Run `flutter build appbundle` to generate a `.aab` file.
5.  **Upload to Console**: Create a release, upload the `.aab` file, fill in store details (screenshots, descriptions), and submit for review.

### 🍎 Apple App Store Deployment

*Requires a Mac computer.*

1.  **Apple Developer Account**: Register at [developer.apple.com](https://developer.apple.com) (requires a yearly $99 fee).
2.  **App Store Connect**: This is where you manage your app listings.
3.  **Configure Certificates**: Use Xcode to create certificates and provisioning profiles (proves you are the developer).
4.  **Build Archive**: Open the iOS project in Xcode, set the target to "Any iOS Device", and click **Product > Archive**.
5.  **Upload to App Store Connect**: Use the Organizer in Xcode to validate and upload your build.
6.  **Submit for Review**: Fill in the details in App Store Connect and submit. Apple's review process is usually stricter than Google's.

---
Need help deciding on the framework or setting up the first steps? Let me know!
