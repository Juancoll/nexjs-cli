
export enum TouchGestureType {
    TAP,
    PRESS,
    SCALE_ROTATE,
    PAN,
    PAN_TWO_FINGERS,
    SWIPE_X,
    SWIPE_Y,
}

export enum TouchGestureStatus {
    START,
    UPDATE,
    END,
}

export class TouchGestureEvent {
    type: TouchGestureType;

    srcX: number = 0;
    srcY: number = 0;

    deltaScale: number = 0;
    deltaRotation: number = 0;
    deltaPanX: number = 0;
    deltaPanY: number = 0;

    scale: number = 1;
    rotation: number = 0;
    panX: number = 0;
    panY: number = 0;

    status: TouchGestureStatus = TouchGestureStatus.START;

    constructor(type: TouchGestureType) {
        this.type = type;
    }
}
