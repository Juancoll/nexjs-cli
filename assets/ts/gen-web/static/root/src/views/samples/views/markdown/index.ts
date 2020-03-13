import './style.scss';

import 'github-markdown-css';
import 'markdown-it-latex/dist/index.css';
import 'markdown-it-icons/dist/index.css';
import '@/assets/scss/markdown-it-vue.scss';
import 'highlight.js/styles/atom-one-light.css';

import { Component, Vue } from 'vue-property-decorator';

// tslint:disable-next-line: no-var-requires
const markdownItVue = require('markdown-it-vue');
Vue.use(markdownItVue.default);

import markdown from './files/readme.md';

@Component({
    template: require('./template.pug'),
})
export default class MarkdownView extends Vue {
    text = markdown;
    options = {
        markdownIt: {
            linkify: true,
        },
    };
}
