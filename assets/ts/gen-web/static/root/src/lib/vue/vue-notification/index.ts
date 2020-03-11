// tslint:disable: variable-name
import Notifications from './Notifications.vue';
import { events } from './events';

const Notify = {
  install(Vue: any, args: any = {}) {
    const me: any = this;
    if (me.installed) {
      return;
    }

    me.installed = true;
    me.params = args;

    Vue.component(args.componentName || 'notifications', Notifications);

    const notify = (params: any) => {
      if (typeof params === 'string') {
        params = { title: '', text: params };
      }

      if (typeof params === 'object') {
        events.$emit('add', params);
      }
    };

    const name = args.name || 'notify';

    Vue.prototype['$' + name] = notify;
    Vue[name] = notify;
  },
};

export default Notify;
