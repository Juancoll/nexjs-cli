export interface IRouteMetadata {
    parent?: string | null;
    showInToolbar: boolean;
    showInDrawer: boolean;
    icon: string;
    iconColor: string | undefined;
    title: string;
    subtitle: string;
}
