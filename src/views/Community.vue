<template>
  <v-dialog
    v-model="CommunitySubmitDialog"
    persistent
    fullscreen
  >
    <v-card>
      <v-toolbar color="indigo" title="Share a plugin to VHCommunity" ></v-toolbar>
     
      <v-card-text>
       
        <br>
        <v-alert v-if="ErrorMessages" v-text="ErrorMessages" color="error"></v-alert>
        
        <v-alert v-if="PluginSubmit.result" v-text="PluginSubmit.result" color="success"></v-alert>
        <br>
        <v-text-field v-model="PluginSubmit.title"
        label="Title"
      ></v-text-field>
      <v-text-field v-model="PluginSubmit.url"
        label="Plugin URL"
      ></v-text-field>
      <v-text-field v-model="PluginSubmit.author"
        label="Plugin Author"
      ></v-text-field>
      <v-textarea clearable   label="Detail" variant="outlined" v-model="PluginSubmit.detail"></v-textarea>
      <div id="submitPluginCaptcha" ></div>

      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" variant="text" @click="CommunitySubmitDialog = false">
          Close
        </v-btn>
        
        <v-btn color="primary" variant="text" @click="submitPlugin()">
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


  <v-app>
    <v-app-bar app>
      <v-toolbar-title>
       <v-img width="128" src="https://i.imgur.com/kgtMWp4.png"/>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      
      <v-btn text><router-link style="color: white" to="/">Home</router-link></v-btn>
      <v-btn color="primary" variant="tonal" @click="CommunitySubmitDialog = true"
        >Sumbit Asset</v-btn
      >
    </v-app-bar>
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" md="3">
            <v-card>
              <v-card-title>Categories</v-card-title>
              <v-list>
                <v-list-item v-for="category in categories" :key="category.id">
                  <v-list-item-content>
                    <v-list-item-title>{{ category.name }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="12" md="9">
            <v-card-title>All Community Resources</v-card-title>
            <v-row>
              <v-col cols="12" md="4" v-for="(item) in allApps">
                <v-lazy transition="v-slide-x-transition">
                <v-card
    class="mx-auto"
    max-width="344"
    variant="outlined"
  >
    <v-card-item>
      <div>
        <div class="text-overline mb-1">
         {{ item.author}}
        </div>
        <div class="text-h6 mb-1">
          {{ item.title }}
        </div>
        <div class="text-caption">{{ item.detail }}</div>
      </div>
    </v-card-item>

    <v-card-actions>
      <v-btn variant="outlined" :href="item.url">
        Download
      </v-btn>
    </v-card-actions>
  </v-card>
  </v-lazy>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
<script>

import Markdown from "../items/Markdown.vue"

import 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";


export default {
  // 當網頁建立
  components: {
    Markdown,
    highlightjs: hljsVuePlugin.component
  },
  mounted() {
   this.list()
  },
  // 一些變數
  data() {
    return {
      CommunitySubmitDialog: false,
      ThemeInfoDialog: false,
      LoadingDialog: false,
      CodeInstallDialog: false,
      ErrorMessages: "",
      PluginSubmit: {
      title: "",
      url: "",
       detail: "",
       captcha: "",
       result: "",
       author: ""
      },

      categories: [{ id: 1, name: "Community" }],

      allApps: [],
      
    };
  },
  watch: {
    CommunitySubmitDialog(val) {
      if (val) {
       setTimeout(() => {
        grecaptcha.render(document.getElementById('submitPluginCaptcha'), {
          'sitekey' : '6Le1IcklAAAAAGkAQU6TnmXYBJz16I7RDRyBixOK',
          'theme' : 'dark',
          'callback': this.recaptchaCallback
        });
       },2000)
      }
    },
  },
  methods: {
    recaptchaCallback(response){
      console.log("Captcha")
      console.log(response)
      this.PluginSubmit.captcha = response
    },
    submitPlugin(){
      this.ErrorMessages = ""
      this.PluginSubmit.result = ""
      let xhr = new XMLHttpRequest();
      xhr.open("POST","https://vhcommunity.imloadinguuu.repl.co/submitPlugin")
      let stringedJSON = JSON.stringify({
         "response": this.PluginSubmit.captcha,
         "detail": this.PluginSubmit.detail,
         "url": this.PluginSubmit.url,
         "title": this.PluginSubmit.title,
         "author": this.PluginSubmit.author
      })
      console.log(stringedJSON)
     
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.onload = () => {
        console.log(xhr)
        let json = JSON.parse(xhr.responseText)
        console.log(json)
        if (json.success) {
         this.PluginSubmit.result = "Success! Your delete token is " + json.deleteToken
        } else {
          this.ErrorMessages = json.error
        }
        grecaptcha.reset()
      }
      xhr.send(stringedJSON)
    },
    list(){
     
      let xhr = new XMLHttpRequest();
      xhr.open("GET","https://vhcommunity.imloadinguuu.repl.co/list/0")
      xhr.onload = () => {
        console.log(xhr.responseText)
        let json = JSON.parse(xhr.responseText)
        console.log(json)
        this.allApps = json
      }
      xhr.send()
    },
    
  },
};
</script>
<style>
img {
   background-size: cover;
   width: 300px
}
</style>