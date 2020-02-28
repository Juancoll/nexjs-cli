import Swal from 'sweetalert2';
import { VueRouterExtended } from '@/lib/router';

export class ErrorService {
    //#region [ public ]
    public catchError(error: any, router: VueRouterExtended) {
        if (error.response) {
            if (error.response.status == 404) {
                Swal.fire('Ops!', `Error: ${error.response.statusText}`, 'error');
            } else if (error.response.status == 401) {
                if (router.currentRoute.path != '/login') {
                    router.pushIfNotCurrent('/login');
                }
                Swal.fire('Ops!', `Error: ${error.response.statusText}`, 'error');
            } else if (error.response.status == 500) {
                Swal.fire('Ops!', `Error: ${error.response.statusText}`, 'error');
            } else {
                const keys = ['data', 'message', 0, 'constraints'];
                let result = error.response;
                keys.forEach(type => {
                    console.log(result, type, result[type]);
                    if (result[type] && ((typeof result == 'string') ? result[type as number].length > 1 : true)) {
                        result = result[type];
                    }
                });
                const json = JSON.stringify(result);
                const objError = JSON.parse(json);
                console.error(objError);
                Swal.fire('Ops!', `Error: ${json}`, 'error');
            }
        } else if (error.message) {
            Swal.fire('Ops!', `Error: ${error.message}`, 'error');
        } else {
            console.error('Error', error.message);
        }
    }
    //#endregion
}
