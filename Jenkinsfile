pipeline {
    agent any
    
    // 🔧 환경 변수 설정
    environment {
        // Node.js 버전
        NODE_VERSION = '18'

        // Java/JDK 버전 (AGP 8.7 요구사항)
        // JAVA_HOME = tool name: 'JDK17', type: 'jdk'

        // Android SDK 경로 (Jenkins 설정에 따라 조정)
        ANDROID_HOME = "${env.ANDROID_SDK_ROOT ?: '/opt/android-sdk'}"

        // 앱 경로
        APP_DIR = 'apps/appdata'

        // 빌드 출력 경로
        APK_OUTPUT_DIR = "${APP_DIR}/android/appdata/build/outputs/apk/release"
        AAB_OUTPUT_DIR = "${APP_DIR}/android/appdata/build/outputs/bundle/release"
    }
    
    // 🔧 빌드 파라미터
    parameters {
        choice(
            name: 'BUILD_TYPE',
            choices: ['apk', 'aab', 'both'],
            description: 'APK 또는 AAB 빌드 선택'
        )
        choice(
            name: 'BUILD_VARIANT',
            choices: ['release', 'debug'],
            description: '빌드 변형 선택'
        )
        string(
            name: 'VERSION_CODE',
            defaultValue: '',
            description: '버전 코드 (비어있으면 build.gradle의 기본값 사용)'
        )
        string(
            name: 'VERSION_NAME',
            defaultValue: '',
            description: '버전 이름 (비어있으면 build.gradle의 기본값 사용)'
        )
    }
    
    stages {
        // 🔧 Stage 1: 환경 점검
        stage('Environment Check') {
            steps {
                script {
                    echo "========================================="
                    echo "환경 점검 시작"
                    echo "========================================="

                    sh '''
                        echo "Node.js 버전:"
                        node --version

                        echo "\nNPM 버전:"
                        npm --version

                        echo "\nYarn 버전:"
                        yarn --version || echo "Yarn not installed"

                        echo "\nJava 버전:"
                        java -version

                        echo "\nGradle 권한 설정..."
                        if [ -f ${APP_DIR}/android/gradlew ]; then
                            chmod +x ${APP_DIR}/android/gradlew
                            echo "✅ gradlew 실행 권한 부여 완료"
                        else
                            echo "⚠️  gradlew 파일이 없습니다."
                        fi

                        echo "\nGradle 버전:"
                        if [ -f ${APP_DIR}/android/gradlew ]; then
                            cd ${APP_DIR} && ./android/gradlew --version
                        else
                            echo "⚠️  gradlew를 찾을 수 없어 Gradle 버전 확인을 건너뜁니다."
                        fi

                        echo "\nAndroid SDK 경로:"
                        echo $ANDROID_HOME

                        echo "\n현재 디렉토리:"
                        pwd
                        ls -la
                    '''
                }
            }
        }
        
        // 🔧 Stage 2: 소스 체크아웃
        stage('Checkout') {
            steps {
                script {
                    echo "========================================="
                    echo "소스 체크아웃"
                    echo "========================================="
                    
                    checkout scm
                    
                    // Git 정보 출력
                    sh '''
                        echo "Git Branch: $(git branch --show-current)"
                        echo "Git Commit: $(git rev-parse --short HEAD)"
                        echo "Git Author: $(git log -1 --pretty=format:'%an')"
                        echo "Git Message: $(git log -1 --pretty=format:'%s')"
                    '''
                }
            }
        }
        
        // 🔧 Stage 3: 의존성 설치 (선택사항)
        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "📦 의존성 설치 중..."

                    # 루트에서 npm install
                    npm install --no-optional --force

                    # Shared 패키지 빌드
                    echo "📦 Shared 패키지 빌드 중..."
                    cd packages/shared
                    npm run build
                    cd ../..

                    echo "✅ 의존성 설치 완료"
                '''
            }
        }

        // 🔧 Stage 4: 환경 준비
        stage('Prepare Build') {
            steps {
                sh '''
                    echo "🔧 빌드 환경 준비 중..."

                    # React Native 플러그인 패치
                    echo "🔧 React Native 플러그인 패치 중..."
                    find . -path "*/node_modules/@react-native/gradle-plugin/*/src/main/kotlin/com/facebook/react/ReactRootProjectPlugin.kt" -type f -exec sed -i 's/:app/:appdata/g' {} + 2>/dev/null || true
                    echo "✅ 플러그인 패치 완료"

                    echo "✅ 빌드 환경 준비 완료"
                '''
            }
        }
        
        // 🔧 Stage 5: 버전 설정
        stage('Set Version') {
            when {
                expression { params.VERSION_CODE != '' || params.VERSION_NAME != '' }
            }
            steps {
                script {
                    echo "========================================="
                    echo "버전 설정"
                    echo "========================================="
                    
                    if (params.VERSION_CODE != '') {
                        echo "버전 코드: ${params.VERSION_CODE}"
                        sh """
                            sed -i 's/versionCode [0-9]*/versionCode ${params.VERSION_CODE}/' ${APP_DIR}/android/appdata/build.gradle
                        """
                    }

                    if (params.VERSION_NAME != '') {
                        echo "버전 이름: ${params.VERSION_NAME}"
                        sh """
                            sed -i 's/versionName \".*\"/versionName \"${params.VERSION_NAME}\"/' ${APP_DIR}/android/appdata/build.gradle
                        """
                    }
                }
            }
        }
        
        // 🔧 Stage 7: APK 빌드
        stage('Build APK') {
            when {
                expression { params.BUILD_TYPE == 'apk' || params.BUILD_TYPE == 'both' }
            }
            steps {
                script {
                    echo "========================================="
                    echo "APK 빌드 시작"
                    echo "========================================="
                    
                    def variant = params.BUILD_VARIANT.capitalize()
                    
                    sh """
                        # 🔧 React Native 0.79+ 호환성 패치: ReactAndroid 디렉토리 생성
                        echo "🔧 React Native 0.79 호환성 패치 중..."
                        echo "현재 디렉토리: \$(pwd)"

                        # 루트 node_modules 경로 (monorepo 루트)
                        ROOT_RN_DIR="node_modules/react-native"
                        APP_RN_DIR="${APP_DIR}/node_modules/react-native"

                        # 1. 루트 node_modules 패치
                        if [ -f "\$ROOT_RN_DIR/gradle.properties" ]; then
                            echo "✅ [ROOT] gradle.properties 발견: \$ROOT_RN_DIR/gradle.properties"
                            mkdir -p "\$ROOT_RN_DIR/ReactAndroid"
                            cp "\$ROOT_RN_DIR/gradle.properties" "\$ROOT_RN_DIR/ReactAndroid/gradle.properties"
                            echo "✅ [ROOT] ReactAndroid/gradle.properties 생성 완료"
                        else
                            echo "⚠️  [ROOT] gradle.properties를 찾을 수 없습니다"
                        fi

                        # 2. apps/appdata/node_modules가 심볼릭 링크로 존재하지 않으면 생성
                        if [ ! -e "${APP_DIR}/node_modules" ]; then
                            echo "📁 ${APP_DIR}/node_modules 심볼릭 링크 생성 중..."
                            ln -s "\$(pwd)/node_modules" "${APP_DIR}/node_modules"
                            echo "✅ 심볼릭 링크 생성 완료"
                        fi

                        # 3. apps/appdata/node_modules/react-native 패치 확인
                        if [ -f "\$APP_RN_DIR/gradle.properties" ]; then
                            echo "✅ [APP] gradle.properties 발견: \$APP_RN_DIR/gradle.properties"
                            mkdir -p "\$APP_RN_DIR/ReactAndroid"
                            cp "\$APP_RN_DIR/gradle.properties" "\$APP_RN_DIR/ReactAndroid/gradle.properties"
                            echo "✅ [APP] ReactAndroid/gradle.properties 생성 완료"
                            ls -la "\$APP_RN_DIR/ReactAndroid/"
                        else
                            echo "❌ [APP] gradle.properties를 찾을 수 없습니다"
                            echo "디렉토리 구조:"
                            ls -la "${APP_DIR}/" || true
                            ls -la "\$APP_RN_DIR/" 2>/dev/null || echo "React Native 디렉토리가 존재하지 않습니다"
                            exit 1
                        fi

                        # 🔧 Monorepo: apps/appdata에서 Gradle 실행 (React Native config 경로 문제 해결)
                        cd ${APP_DIR}
                        chmod +x android/gradlew

                        # 환경변수 확인
                        echo "KEYSTORE_PATH: \${KEYSTORE_PATH}"
                        echo "KEY_ALIAS: \${KEY_ALIAS}"

                        # APK 빌드
                        ./android/gradlew -p android assemble${variant} \
                            -PKEYSTORE_PATH=\${KEYSTORE_PATH} \
                            -PKEYSTORE_PASSWORD=\${KEYSTORE_PASSWORD} \
                            -PKEY_ALIAS=\${KEY_ALIAS} \
                            -PKEY_PASSWORD=\${KEY_PASSWORD} \
                            --stacktrace \
                            --info

                        echo "✅ APK 빌드 완료"

                        # 빌드된 APK 확인
                        ls -lh android/appdata/build/outputs/apk/${params.BUILD_VARIANT}/
                    """
                }
            }
        }
        
        // 🔧 Stage 8: AAB 빌드 (Google Play 배포용)
        stage('Build AAB') {
            when {
                expression { params.BUILD_TYPE == 'aab' || params.BUILD_TYPE == 'both' }
            }
            steps {
                script {
                    echo "========================================="
                    echo "AAB 빌드 시작"
                    echo "========================================="
                    
                    def variant = params.BUILD_VARIANT.capitalize()
                    
                    sh """
                        # 🔧 React Native 0.79+ 호환성 패치: ReactAndroid 디렉토리 생성
                        echo "🔧 React Native 0.79 호환성 패치 중..."

                        # apps/appdata/node_modules가 심볼릭 링크로 존재하지 않으면 생성
                        if [ ! -e "${APP_DIR}/node_modules" ]; then
                            echo "📁 ${APP_DIR}/node_modules 심볼릭 링크 생성 중..."
                            ln -s "\$(pwd)/node_modules" "${APP_DIR}/node_modules"
                            echo "✅ 심볼릭 링크 생성 완료"
                        fi

                        # apps/appdata/node_modules/react-native 패치
                        APP_RN_DIR="${APP_DIR}/node_modules/react-native"
                        if [ -f "\$APP_RN_DIR/gradle.properties" ]; then
                            echo "✅ gradle.properties 발견"
                            mkdir -p "\$APP_RN_DIR/ReactAndroid"
                            cp "\$APP_RN_DIR/gradle.properties" "\$APP_RN_DIR/ReactAndroid/gradle.properties"
                            echo "✅ ReactAndroid/gradle.properties 생성 완료"
                        else
                            echo "❌ gradle.properties를 찾을 수 없습니다"
                            exit 1
                        fi

                        # 🔧 Monorepo: apps/appdata에서 Gradle 실행 (React Native config 경로 문제 해결)
                        cd ${APP_DIR}
                        chmod +x android/gradlew

                        # AAB 빌드
                        ./android/gradlew -p android bundle${variant} \
                            -PKEYSTORE_PATH=\${KEYSTORE_PATH} \
                            -PKEYSTORE_PASSWORD=\${KEYSTORE_PASSWORD} \
                            -PKEY_ALIAS=\${KEY_ALIAS} \
                            -PKEY_PASSWORD=\${KEY_PASSWORD} \
                            --stacktrace \
                            --info

                        echo "✅ AAB 빌드 완료"

                        # 빌드된 AAB 확인
                        ls -lh android/appdata/build/outputs/bundle/${params.BUILD_VARIANT}/
                    """
                }
            }
        }
        
        // 🔧 Stage 9: 아티팩트 보관
        stage('Archive Artifacts') {
            steps {
                script {
                    echo "========================================="
                    echo "아티팩트 보관"
                    echo "========================================="
                    
                    // APK 보관
                    if (params.BUILD_TYPE == 'apk' || params.BUILD_TYPE == 'both') {
                        archiveArtifacts artifacts: "${APK_OUTPUT_DIR}/*.apk",
                                        allowEmptyArchive: true,
                                        fingerprint: true
                    }
                    
                    // AAB 보관
                    if (params.BUILD_TYPE == 'aab' || params.BUILD_TYPE == 'both') {
                        archiveArtifacts artifacts: "${AAB_OUTPUT_DIR}/*.aab",
                                        allowEmptyArchive: true,
                                        fingerprint: true
                    }
                    
                    // 매핑 파일 보관 (ProGuard)
                    archiveArtifacts artifacts: "${APP_DIR}/android/appdata/build/outputs/mapping/**/*",
                                    allowEmptyArchive: true,
                                    fingerprint: true
                    
                    echo "✅ 아티팩트 보관 완료"
                }
            }
        }
        
    }
    
    // 🔧 빌드 후 처리
    post {
        success {
            echo "========================================="
            echo "✅ 빌드 성공!"
            echo "========================================="
            
            script {
                // 빌드 정보 출력
                sh """
                    echo "빌드 타입: ${params.BUILD_TYPE}"
                    echo "빌드 변형: ${params.BUILD_VARIANT}"
                    echo "버전 코드: ${params.VERSION_CODE ?: '기본값'}"
                    echo "버전 이름: ${params.VERSION_NAME ?: '기본값'}"
                    echo "========================================="
                """
                
                // Slack/Email 알림 (선택사항)
                // slackSend channel: '#builds', 
                //           color: 'good', 
                //           message: "빌드 성공: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            }
        }
        
        failure {
            echo "========================================="
            echo "❌ 빌드 실패!"
            echo "========================================="
            
            // 실패 알림 (선택사항)
            // slackSend channel: '#builds', 
            //           color: 'danger', 
            //           message: "빌드 실패: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
        
        always {
            script {
                echo "========================================="
                echo "워크스페이스 정리"
                echo "========================================="

                // 임시 파일 정리
                try {
                    cleanWs(
                        cleanWhenNotBuilt: false,
                        deleteDirs: true,
                        disableDeferredWipeout: true,
                        notFailBuild: true
                    )
                    echo "✅ 워크스페이스 정리 완료"
                } catch (Exception e) {
                    echo "⚠️  워크스페이스 정리 실패: ${e.message}"
                    // 실패해도 빌드는 계속 진행
                }
            }
        }
    }
}
