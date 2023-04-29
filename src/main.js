import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'highlight.js/styles/stackoverflow-dark.css'
import 'highlight.js/lib/common';


const vuetify = createVuetify({
  components,
  directives,
})



const app = createApp(App)

app.use(router)
app.use(vuetify)
app.mount('#app')
