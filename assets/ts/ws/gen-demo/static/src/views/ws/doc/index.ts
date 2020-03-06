import './style.scss';
import 'markdown-it-latex/dist/index.css';
import 'markdown-it-icons/dist/index.css';
import 'github-markdown-css';
import '@/assets/scss/markdown-it-vue.scss';

import { Component, Vue } from 'vue-property-decorator';
import 'highlight.js/styles/atom-one-light.css';

import markdown from './md/readme.md';
// tslint:disable-next-line: no-var-requires
const markdownItVue = require('markdown-it-vue');

Vue.use(markdownItVue.default);

@Component({
    template: require('./template.pug'),
})
export default class WSDocView extends Vue {
    text = markdown;
    options = {
        markdownIt: {
            linkify: true,
        },
    };
    mounted() {
        const a = 0;
    }
}
