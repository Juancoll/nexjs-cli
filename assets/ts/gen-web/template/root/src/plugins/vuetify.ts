import Vue from 'vue';
import Vuetify from 'vuetify';
import colors from 'vuetify/es5/util/colors';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: {{isDark}},
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: '{{style.colors.primary}}',
                secondary: '{{style.colors.secondary}}',
                accent: '{{style.colors.accent}}',
                error: colors.deepOrange.base,
                warning: colors.orange.base,
                info: colors.blue.base,
                success: colors.green.base,
            },
            dark: {
                primary: '{{style.colors.primary}}',
                secondary: '{{style.colors.secondary}}',
                accent: '{{style.colors.accent}}',
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
