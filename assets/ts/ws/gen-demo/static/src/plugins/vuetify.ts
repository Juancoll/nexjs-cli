import Vue from 'vue';
import Vuetify from 'vuetify';
import colors from 'vuetify/es5/util/colors';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        dark: true,
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: '#4bf9cd',
                secondary: '#6348B5',
                accent: '#6348B5',
                error: colors.deepOrange.base,
                warning: colors.orange.base,
                info: colors.blue.base,
                success: colors.green.base,
            },
            dark: {
                primary: '#4bf9cd',
                secondary: '#6348B5',
                accent: '#6348B5',
                error: colors.red.base,
                warning: colors.yellow.base,
                info: colors.blue.base,
                success: colors.green.base,
                newDark: {
                    base: '#1e1e2f',
                    lighten2: '#34384c',
                },
            },
        },
    },
    icons: {
        iconfont: 'mdi',
    },
});
