import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

import '@/assets/custom.scss';

import BootstrapVue3 from 'bootstrap-vue-3';

const app = createApp(App);
app.use(BootstrapVue3);
app.mount('#app');

