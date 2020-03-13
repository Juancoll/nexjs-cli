import Vue from 'vue';
import Vuetify from 'vuetify';
import colors from 'vuetify/es5/util/colors';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: {{style.dark}},
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: '{{style.primary}}',
                secondary: '{{style.secondary}}',
                accent: '{{style.accent}}',
                error: colors.deepOrange.base,
                warning: colors.orange.base,
                info: colors.blue.base,
                success: colors.green.base,
            },
            dark: {
                primary: '{{style.primary}}',
                secondary: '{{style.secondary}}',
                accent: '{{style.accent}}',
                error: colors.red.base,
                warning: colors.yellow.base,
                info: colors.blue.base,
                success: colors.green.base,
            },
        },
    },
    icons: {
        iconfont: 'mdi',
    },
});
