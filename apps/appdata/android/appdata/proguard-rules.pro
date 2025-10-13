# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# 🔧 React Native Core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# 🔧 React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# 🔧 React Native WebView
-keep class com.reactnativecommunity.webview.** { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 🔧 Expo Modules
-keep class expo.modules.** { *; }
-keep class expo.modules.core.** { *; }
-keep class expo.modules.kotlin.** { *; }

# 🔧 React Navigation
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }

# 🔧 Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# 🔧 Expo Location
-keep class expo.modules.location.** { *; }
-keep class expo.modules.interfaces.permissions.** { *; }

# 🔧 Kotlin
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}

# 🔧 OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# 🔧 Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# 🔧 JSC (JavaScriptCore)
-keep class org.webkit.** { *; }

# 🔧 Fresco (이미지 라이브러리)
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip
-keep @com.facebook.common.internal.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.common.internal.DoNotStrip *;
}

# 🔧 일반적인 난독화 제외
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes InnerClasses

# 🔧 Enum 클래스 유지
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# 🔧 Parcelable 구현 유지
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# 🔧 Serializable 유지
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# 🔧 Native Methods 유지
-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}

# Add any project specific keep options here:
