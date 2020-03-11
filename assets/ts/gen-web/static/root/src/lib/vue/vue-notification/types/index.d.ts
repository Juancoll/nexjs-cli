import _Vue from 'vue';
import { INotification } from "./INotification"
import { INotificationClean } from "./INotificationClean"

declare module 'vue/types/vue' {
    interface Vue {
        $notify: (arg: INotification | INotificationClean | string) => HTMLElement;
    }
}
