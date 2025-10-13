// 루트 index.js
import { registerRootComponent } from 'expo';
import App from './apps/appdata/src/App'; // 실제 TSX 엔트리
registerRootComponent(App);