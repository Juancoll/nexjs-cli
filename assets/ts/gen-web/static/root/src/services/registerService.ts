
/**
 * register on window.services.[name] the instance of service
 * @param {string} name - Register ser
 * @param {any} service - service instance
 */
export const registerService = (name: string, service: any) => {
    if (!((window as any).services)) {
        (window as any).services = {};
    }

    (window as any).services = Object.assign((window as any).services, { [name]: service });
};
