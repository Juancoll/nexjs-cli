import './style.scss';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    template: require('./template.pug'),
})
export default class HomeView extends Vue {
}
