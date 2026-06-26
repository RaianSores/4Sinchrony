## 🚀 Tecnologias

- React Native
- Android (Gradle)
- ADB (Android Debug Bridge)


## 🧹 Limpeza e Desinstalação

- adb uninstall com.sinchronyapp

 - cd android
    - ./gradlew clean

---
## 🏗️ Gerar APK (Release)

- ./gradlew assembleRelease

---
# 🔍 Com stacktrace (debug detalhado)

- ./gradlew assembleRelease --stacktrace

---
# 📦 Gerar AAB (Play Store)

- ./gradlew bundleRelease

---
# ▶️ Rodar App (Debug)

- npx react-native run-android

---
# 📲 Instalar APK manualmente

- cd app/build/outputs/apk/release
- adb install app-release.apk
- adb -s 192.168.0.146:43833 install app-release.apk

---
# 📊 Logs (ADB Logcat)

- adb logcat | findstr ReactNative

---
# ⚡ Fluxo Completo Recomendado

- adb uninstall com.sinchronyapp
- adb -s 192.168.0.146:35069 install app-release.apk


- cd android
  -  ./gradlew clean
  -  ./gradlew assembleRelease

- cd app/build/outputs/apk/release
    - adb install app-release.apk
    - adb logcat | findstr ReactNative