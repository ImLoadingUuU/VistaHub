<template>
  <div v-html="marked($props.source,$props.options) "></div>
</template>

<script>
import { marked } from 'marked';
export default {
    name: 'Markdown',
    props: ["source","options"],
    data(){
        return {
            marked: marked
        }
    }
}
</script>