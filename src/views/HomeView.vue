<template>
  <v-dialog
    v-model="ConfigDialog"
    width="auto"
  >
    <v-card>
      <v-card-title> Config </v-card-title>
      <v-card-text>
        You can change the repository URL here.
        <v-text-field
          label="Theme Repository (User/Repo)"
          v-model="ThemeRepo.Repo"
          :error-messages="ThemeRepo.ErrorMessages"
          @change="getBranches()"
        ></v-text-field>
        <v-select
          label="Select a Branches"
          item-title="name"
          :items="ThemeRepo.Branches"
          v-model="ThemeRepo.Branch"
        ></v-select>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" variant="text" @click="ConfigDialog = false">
          Close
        </v-btn>
        <v-btn color="primary" variant="text" @click="setRepoInfo()">
          Apply Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog
    v-model="ThemeInfoDialog"
    width="auto"
    transition="scroll-x-transition"
    fullscreen
    max-width="350"
  >
    <v-img
      src="https://picsum.photos/700/400?random"
      height="200"
      width="350"
      class="align-end"
      cover
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
    >
      <v-card-title class="text-white" v-text="CurrentTheme"></v-card-title>
    </v-img>
    <v-card>
      <v-card-text  v-if="CurrentContent" >
       <Markdown :options="ThemeRepo.MDOptions" :source="CurrentContent"  ></Markdown>
      </v-card-text>

      <v-card-actions>
        <v-btn color="primary" block @click="ThemeInfoDialog = false"
          >Close Dialog</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="LoadingDialog" :scrim="false" persistent width="auto">
    <v-card color="primary">
      <v-card-text>
        Please stand by
        <v-progress-linear
          indeterminate
          color="white"
          class="mb-0"
        ></v-progress-linear>
      </v-card-text>
    </v-card>
  </v-dialog>
  <v-dialog v-model="CodeInstallDialog" width="400" transition="scroll-y-transition" >
    <v-card>

      <v-toolbar color="blue"  title="Install Theme Introducion!"></v-toolbar>
      <v-card-text>
        <v-alert text="Recommmened Read Detail before you install!" type="warning" variant="outlined"></v-alert>
        <div v-for="(item) in ThemeRepo.CSSFiles">
          <v-alert style="margin: 5px">
          <v-alert-title>
            {{  item.name  }}
            <v-chip
      class="ma-2"
      color="primary"
      variant="elevated"
      v-if="item.alias"
      v-text="item.alias"
    >
      
    </v-chip>
          </v-alert-title>
          <v-alert-text>
            <highlightjs language="html" :code="item.code"> 
             
            </highlightjs>
          </v-alert-text>

          </v-alert>
       
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="CodeInstallDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>
       <v-img width="128" src="https://i.imgur.com/kgtMWp4.png"/>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-chip
        variant="outlined"
        v-if="ErrorMessages"
        v-text="ErrorMessages"
        color="red"
      ></v-chip>
      <v-btn text ><router-link style="color: white" to="community">Community</router-link></v-btn>
      <v-btn color="primary" variant="tonal" @click="ConfigDialog = true"
        >Config</v-btn
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
            <v-card-title>All Themes</v-card-title>
            <v-row>
              <v-col cols="12" md="4" v-for="app in allApps" :key="app.id">
                <v-lazy
                  :options="{ threshold: 1 }"
                  transition="scroll-x-transition"
                >
                  <v-card variant="tonal" style="margin: 10px">
                    <v-img  lazy-src="https://picsum.photos/700/400?random&grayscale&blur=2" :src="app.image" height="200px" cover>
                      <template v-slot:placeholder>
      <div class="d-flex align-center justify-center fill-height">
        <v-progress-circular
          color="grey-lighten-4"
          indeterminate
        ></v-progress-circular>
      </div>
    </template>
    <template v-slot:error>
   
      <div class="d-flex align-center justify-center fill-height">
        <v-icon icon="mdi-alert"></v-icon>
        <p class="text-caption">Image not available </p>
      </div>
</template></v-img>

                    <v-card-title>{{ app.name }}</v-card-title>
                    <v-card-text>{{ app.description }}</v-card-text>
                    <v-card-actions>
                      <v-btn
                        color="primary"
                        @click="showThemeInfo(app.originalName)"
                        text
                        >Details</v-btn
                      >
                      <v-btn color="secondary" @click="ShowCodeInstall(app.sha,app.originalName)" text>Install</v-btn>
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

const readFolderFromAPI =  (sha) => {
  return new Promise((resolve, reject) => {
  let xhr = new XMLHttpRequest()
  xhr.open("GET",`https://api.github.com/repos/WybeNetwork/VistaPanel-Themes/git/trees/${sha}`)

  xhr.onload = () => {
      if(xhr.status == 200){
        console.log("Responsed")
          resolve(xhr)
      } else {
          reject(new Error(`連結失敗${xhr.status}`))
      }
  }
  xhr.send()
})
}
import 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";


export default {
  // 當網頁建立
  components: {
    Markdown,
    highlightjs: hljsVuePlugin.component
  },
  mounted() {
    // 獲取所有資料夾
    if(!window.localStorage.getItem("ThemeRepo")){
      window.localStorage.setItem("ThemeRepo", "WybeNetwork/VistaPanel-Themes");
    window.localStorage.setItem("ThemeBranch", "master")
    }
    // this.ThemeRepo.MDOptions.baseUrl = `https://github.com/${this.ThemeRepo.Repo}/blob/${this.ThemeRepo.Branch}/${this.CurrentTheme}`
    this.refresh();
  },
  // 一些變數
  data() {
    return {
      ConfigDialog: false,
      ThemeInfoDialog: false,
      LoadingDialog: false,
      CodeInstallDialog: false,
      ErrorMessages: "",
      
      ThemeRepo: {
        ErrorMessages: "",
        Repo:  window.localStorage.getItem("ThemeRepo") || "WybeNetwork/VistaPanel-Themes",
        Branches: [],
        Branch: window.localStorage.getItem("ThemeBranch") || "master",
        CSSFiles: [],
        MDOptions: { baseUrl: `` }
      },
      CurrentTheme: "",
      CurrentContent: "",

      categories: [{ id: 1, name: "Themes" }],

      allApps: [],
    };
  },
  watch: {
    ConfigDialog(val) {
      if (val) {
        this.getBranches();
      }
    },
  },
  methods: {
    getBranches() {
      console.log("Getting branches");
      this.ThemeRepo.ErrorMessages = "";
      var xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        `https://api.github.com/repos/${
          this.ThemeRepo.Repo || "WybeNetwork/VistaPanel-Themes"
        }/branches`
      );
      xhr.onload = () => {
        console.log(xhr.status);

        if (xhr.status == 200) {
          let branches = JSON.parse(xhr.responseText);
          if (branches.message) {
            this.ThemeRepo.ErrorMessages = branches.message;
            return;
          }
          this.ThemeRepo.Branches = branches;
          console.log(branches);
        } else if (xhr.status == 404) {
          let branches = JSON.parse(xhr.responseText);
          this.ThemeRepo.ErrorMessages = "404 Error " + branches.message;
        }
      };

      xhr.send();
    },
    refresh() {
      let xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        `https://api.github.com/repos/${this.ThemeRepo.Repo}/git/trees/${this.ThemeRepo.Branch}`
      );
      xhr.onload = () => {
        if (xhr.status == 200) {
          console.log("success");
          function capitalizeAndReplace(str) {
            // 将字符串分割成单词数组
            const words = str.split("-");

            // 将每个单词的首字母大写并合并回字符串
            const capitalizedWords = words.map((word) => {
              return word.charAt(0).toUpperCase() + word.slice(1);
            });

            // 将单词合并回字符串并用空格分隔
            const result = capitalizedWords.join(" ");

            return result;
          }
          var items = JSON.parse(xhr.responseText).tree;
          for (let i = 0; items.length > i; i++) {
            if (items[i].type !== "tree") continue;
            this.allApps.push({
              id: i,
              name: capitalizeAndReplace(items[i].path),
              originalName: items[i].path,
              description: "Theme.",
              image: `https://github.com/${this.ThemeRepo.Repo}/blob/master/${items[i].path}/preview.png?raw=true`,
              sha: items[i].sha
            });
          }
        } else {
          console.warn(`Error ${xhr.status} - ${xhr.statusText}}`);
        }
      };
      xhr.send();
    },
    showThemeInfo(name) {
      console.log(name);
      this.LoadingDialog = true;
      
      let xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        `https://raw.githubusercontent.com/${this.ThemeRepo.Repo}/${this.ThemeRepo.Branch}/${name}/README.md`
      );
      xhr.onload = () => {
        if (xhr.status == 200) {
          console.log( `https://github.com/${this.ThemeRepo.Repo}/blob/${this.ThemeRepo.Branch}/` + name);
          console.log(xhr.responseText);
          this.CurrentContent = xhr.responseText;
          this.CurrentTheme = name;
          this.ThemeRepo.MDOptions.baseUrl = `https://cdn.jsdelivr.net/gh/${this.ThemeRepo.Repo}@${this.ThemeRepo.Branch}/${name}/`
          this.ThemeInfoDialog = true;
          this.LoadingDialog = false;
        } else {
          this.LoadingDialog = false;
          console.warn(`Error ${xhr.status} - ${xhr.statusText}}`);
          this.ErrorMessages = `Couldnt load info`;
          this.CurrentContent = "Sorry, we couldnt load the info.";
          this.ThemeInfoDialog = true
          this.CurrentTheme = name
        }
      };
      xhr.send();
    },
    async ShowCodeInstall (sha,theme){
      this.LoadingDialog = true
      this.ThemeRepo.CSSFiles=  []
     
      let xhr = await readFolderFromAPI(sha)
      let json = JSON.parse(xhr.response)
      this.LoadingDialog = false
      this.CodeInstallDialog = true;
      console.log(json)
      let files = json.tree
      files.forEach(file => {
        console.log(file)
        let ext = file.path.split('.').pop();
        if (ext == "css") {
          console.warn("Found CSS file")
          let alias = {
            ["styles.css"]: "Panel Stylefile",
            ["styles.min.css"]: "Minified Panel Style",
            ["panel.css"]: "Panel CSS",
            ["icon_spritemap.css"]: "Icon CSS"
          }
          this.ThemeRepo.CSSFiles.push({
            name: file.path,
            alias: alias[file.path] || undefined,
            theme: theme,
            code: ` <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/${this.ThemeRepo.Repo}@tree/${this.ThemeRepo.Branch}/${theme}/${file.path}">`
          })
        }
      });
    },
    setRepoInfo(){
      window.localStorage.setItem("ThemeRepo", this.ThemeRepo.Repo);
      window.localStorage.setItem("ThemeBranch", this.ThemeRepo.Branch)
      this.allApps = []
      this.refresh()
    }
  },
};
</script>
<style>
img {
   background-size: cover;
   width: 300px
}
</style>