import Vue from 'vue';
import Component from 'vue-class-component';
import { RouteConfig } from 'vue-router';
import { Prop } from 'vue-property-decorator';
import router from '@/router';

@Component({
    template: require('./template.pug'),
})
export default class RouterMenuItem extends Vue {
    // props
    @Prop({ required: true, type: Object }) route: RouteConfig | null | undefined;

    // computed
    public get children(): RouteConfig[] {
        if (!this.route || !this.route.children || this.route.children.length == 0) {
            return [];
        }

        return this.route.children;
    }

    // actions
    public goToRoute(route: RouteConfig) {
        router.pushIfNotCurrent(route.path);
    }

    mounted() {
        console.log('[RouterMenuItem] mounted');
    }
}
