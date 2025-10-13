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
                            cd ${APP_DIR}/android && ./gradlew --version
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
        
        // 🔧 Stage 3: 의존성 설치
        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "📦 루트 의존성 설치..."
                    node -v
                    npm -v

                    # lock 파일에 있는 optional deps도 건너뛰기 위해 --no-optional --force 사용
                    npm install --no-optional --force

                    echo "📦 Shared 패키지 빌드..."
                    cd packages/shared
                    npm install --no-optional --force
                    npm run build
                    cd ../..

                    echo "📦 앱 의존성 정리..."
                    if [ -d "${APP_DIR}" ] && [ -f "${APP_DIR}/package.json" ]; then
                        cd ${APP_DIR}
                        npm install --no-optional --force
                        cd ../..
                    else
                        echo "⚠️  ${APP_DIR}에 package.json이 없습니다."
                        echo "중복된 node_modules 제거 중..."

                        # apps/appdata/node_modules가 있으면 제거 (Gradle 충돌 방지)
                        if [ -d "${APP_DIR}/node_modules" ] || [ -L "${APP_DIR}/node_modules" ]; then
                            rm -rf ${APP_DIR}/node_modules
                            echo "✅ ${APP_DIR}/node_modules 제거 완료"
                        fi
                    fi

                    echo "✅ 의존성 설치 완료"

                    echo "🔧 React Native 플러그인 패치 중..."
                    # :app을 :appdata로 변경
                    find node_modules/@react-native/gradle-plugin -name "ReactRootProjectPlugin.kt" -type f -exec sed -i 's/:app/:appdata/g' {} +
                    echo "✅ 플러그인 패치 완료"
                '''
            }
        }
        
        // 🔧 Stage 4: 린트 검사 (선택사항)
        stage('Lint') {
            when {
                expression { params.BUILD_VARIANT == 'release' }
            }
            steps {
                script {
                    echo "========================================="
                    echo "린트 검사"
                    echo "========================================="
                    
                    catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                        sh '''
                            cd ${APP_DIR}
                            npm run lint || echo "⚠️  Lint 경고 있음"
                        '''
                    }
                }
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
        
        // 🔧 Stage 6: Gradle 정리
        stage('Clean') {
            steps {
                script {
                    echo "========================================="
                    echo "Gradle 정리"
                    echo "========================================="

                    sh '''
                        # Gradle 플러그인 충돌 방지: appdata/node_modules 제거
                        if [ -d "${APP_DIR}/node_modules" ] || [ -L "${APP_DIR}/node_modules" ]; then
                            echo "⚠️  ${APP_DIR}/node_modules 제거 중..."
                            rm -rf ${APP_DIR}/node_modules
                            echo "✅ ${APP_DIR}/node_modules 제거 완료"
                        fi

                        # node_modules 내의 Gradle 플러그인 빌드 결과물 삭제
                        echo "🗑️  node_modules Gradle 플러그인 빌드 결과물 삭제 중..."
                        rm -rf node_modules/@react-native/gradle-plugin/*/build
                        rm -rf node_modules/expo-modules-autolinking/android/expo-gradle-plugin/*/build
                        rm -rf node_modules/expo-modules-core/android/build
                        echo "✅ 플러그인 빌드 결과물 삭제 완료"

                        # Kotlin 2.1.20 캐시 완전 삭제
                        echo "🗑️  Kotlin 2.1.20 캐시 삭제 중..."
                        rm -rf ~/.gradle/caches/modules-2/files-2.1/org.jetbrains.kotlin/kotlin-stdlib/2.1.20
                        rm -rf ~/.gradle/caches/modules-2/files-2.1/org.jetbrains.kotlin/kotlin-stdlib-jdk7/2.1.20
                        rm -rf ~/.gradle/caches/modules-2/files-2.1/org.jetbrains.kotlin/kotlin-stdlib-jdk8/2.1.20
                        rm -rf ~/.gradle/caches/modules-2/files-2.1/org.jetbrains.kotlin/kotlin-stdlib-common/2.1.20
                        rm -rf ~/.gradle/caches/*/kotlin-compiler-embeddable-2.1.20*
                        echo "✅ Kotlin 2.1.20 캐시 삭제 완료"

                        # 프로젝트 로컬 캐시도 삭제
                        cd ${APP_DIR}/android
                        rm -rf .gradle
                        rm -rf build
                        rm -rf appdata/build

                        chmod +x gradlew
                        ./gradlew clean --no-build-cache
                        echo "✅ Gradle 정리 완료"
                    '''
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
                        cd ${APP_DIR}/android
                        chmod +x gradlew

                        # 환경변수 확인
                        echo "KEYSTORE_PATH: \${KEYSTORE_PATH}"
                        echo "KEY_ALIAS: \${KEY_ALIAS}"

                        # APK 빌드
                        ./gradlew assemble${variant} \
                            -PKEYSTORE_PATH=\${KEYSTORE_PATH} \
                            -PKEYSTORE_PASSWORD=\${KEYSTORE_PASSWORD} \
                            -PKEY_ALIAS=\${KEY_ALIAS} \
                            -PKEY_PASSWORD=\${KEY_PASSWORD} \
                            --stacktrace \
                            --info

                        echo "✅ APK 빌드 완료"

                        # 빌드된 APK 확인
                        ls -lh appdata/build/outputs/apk/${params.BUILD_VARIANT}/
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
                        cd ${APP_DIR}/android
                        chmod +x gradlew

                        # AAB 빌드
                        ./gradlew bundle${variant} \
                            -PKEYSTORE_PATH=\${KEYSTORE_PATH} \
                            -PKEYSTORE_PASSWORD=\${KEYSTORE_PASSWORD} \
                            -PKEY_ALIAS=\${KEY_ALIAS} \
                            -PKEY_PASSWORD=\${KEY_PASSWORD} \
                            --stacktrace \
                            --info

                        echo "✅ AAB 빌드 완료"

                        # 빌드된 AAB 확인
                        ls -lh appdata/build/outputs/bundle/${params.BUILD_VARIANT}/
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
        
        // 🔧 Stage 10: 테스트 (선택사항)
        stage('Test') {
            when {
                expression { params.BUILD_VARIANT == 'release' }
            }
            steps {
                script {
                    echo "========================================="
                    echo "테스트 실행"
                    echo "========================================="
                    
                    catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                        sh '''
                            cd ${APP_DIR}/android
                            chmod +x gradlew
                            ./gradlew test || echo "⚠️  테스트 실패"
                        '''
                    }
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
