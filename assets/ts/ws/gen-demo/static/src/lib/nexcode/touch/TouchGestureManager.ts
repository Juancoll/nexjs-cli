import { TouchGestureEvent, TouchGestureStatus, TouchGestureType } from './TouchGestures';

interface IVector2 {
    x: number;
    y: number;
}

interface IFinger {
    start: IVector2;
    current: IVector2;
    old: IVector2 | undefined;
    acum: IVector2;
    startMillis: number;
    dx: number;
    dy: number;
}

export class TouchGestureManager {

    private fingers: IFinger[] = [];

    isTap: boolean = false;
    isPress: boolean = false;
    isScale: boolean = false;
    isRotate: boolean = false;
    isPan: boolean = false;
    isTwoFingersPan: boolean = false;
    isSwipeX: boolean = false;
    isSwipeY: boolean = false;

    gestureScaleRotate: TouchGestureEvent | null | undefined = null;
    gesturePan: TouchGestureEvent | null | undefined = null;
    gesturePanTwoFingers: TouchGestureEvent | null = null;

    sendTouch(te: TouchGestureEvent) { /* empty */ }

    constructor() {/* empty */ }

    private getDist(a: IVector2, b: IVector2): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private getAngle(a: IVector2, b: IVector2): number {
        return Math.atan2((a.y - b.y), (a.x - b.x)) * (180 / Math.PI);
    }

    /*
        Handle TOUCH START
    */
    handleTouchStart(te: TouchEvent) {

        /*
    TAP
        one finger, <600ms, max pos diff <5%

    PRESS
        one finger, >600ms, max pos diff <5%

    SCALE
        two fingers

    ROTATE
        two fingers, similar to scale

    PAN
        one finger, max pos diff >5%

    PAN_TWO_FINGERS
        two fingers, max pos diff >5%, maxPos diff between two fingers < 5%

    SWIPE_X
        one finger, max posX diff >15% max posY diff < 15%

    SWIPE_Y
        one finger, max posY diff >15% max posX diff < 15%
    */

        // console.log("%cTOUCH START", 'font-weight:bolder');
        // console.log(this.fingers);
        // for (let f of this.fingers) console.log(f);

        const wndWidth = window.innerWidth;
        const wndHeight = window.innerHeight;

        const touches = te.touches;

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < te.touches.length; ++i) {
            const ct = te.touches[i];

            const nx = ct.clientX / wndWidth;
            const ny = ct.clientY / wndHeight;

            /*if (this.fingers[ct.identifier] != undefined) {
                //console.log('%cWARNING Starting an already existing finger', 'background-color:#f77');
            }
            else */
            this.fingers[ct.identifier] = {
                start: { x: nx, y: ny },
                current: { x: nx, y: ny },
                old: undefined,
                startMillis: +new Date(),
                acum: { x: 0, y: 0 },
                dx: 0, dy: 0,
            };
            // console.log('%cNew finger! '+ct.identifier, 'background-color:#77f');
        }

    }

    /*
        Handle TOUCH MOVE
    */
    handleTouchMove(te: TouchEvent) {

        // console.log("%cTOUCH MOVE", 'font-weight:bolder');
        // console.log(this.fingers);
        // for (let f of this.fingers) console.log(f);

        const wndWidth = window.innerWidth;
        const wndHeight = window.innerHeight;

        let numFingers = 0;
        const fingers: IFinger[] = [];

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < te.touches.length; ++i) {
            const ct = te.touches[i];

            const nx = ct.clientX / wndWidth;
            const ny = ct.clientY / wndHeight;

            if (this.fingers[ct.identifier] == undefined) {
                console.log('%cWARNING Moving an non-existing finger ' + ct.identifier, 'background-color:#f77');
            } else {
                const cf = this.fingers[ct.identifier];
                cf.old = cf.current;
                cf.current = { x: nx, y: ny };

                // TODO calculate monotonic finger direction for swipes
                if (cf.old != undefined) {

                    const dx = cf.current.x - cf.old.x;
                    const dy = cf.current.y - cf.old.y;

                    cf.acum.x += dx < 0 ? -dx : dx;
                    cf.acum.y += dy < 0 ? -dy : dy;

                    cf.dx = dx;
                    cf.dy = dy;
                }

                fingers.push(cf);
                numFingers++;
            }
        }

        // -- ONE FINGER --
        if (numFingers == 1) {

            const finger = fingers[0];

            // check for PRESS
            // if time elapsed > 500, create PRESS event
            if (+new Date() - finger.startMillis >= 500 && finger.acum.x < 0.05 && finger.acum.y < 0.05) {
                // console.log("%cPRESS at "+finger.start.x+", "+finger.start.y, "background-color:#faa");

                const gest = new TouchGestureEvent(TouchGestureType.PRESS);
                gest.srcX = finger.start.x;
                gest.srcY = finger.start.y;

                this.sendTouch(gest);
            }

            // check for PAN
            if (finger.acum.x > 0.05 || finger.acum.y > 0.05) {

                if (this.gesturePan == undefined) {
                    this.gesturePan = new TouchGestureEvent(TouchGestureType.PAN);
                    this.gesturePan.srcX = finger.start.x;
                    this.gesturePan.srcY = finger.start.y;
                } else {
                    this.gesturePan.status = TouchGestureStatus.UPDATE;
                }

                if (finger.old) {
                    this.gesturePan.deltaPanX = (finger.current.x - finger.old.x);
                    this.gesturePan.deltaPanY = (finger.current.y - finger.old.y);
                }

                this.gesturePan.panX = (finger.current.x - finger.start.x);
                this.gesturePan.panY = (finger.current.y - finger.start.y);

                // console.log("%cPAN "+JSON.stringify(this.gesturePan), "background-color:#faa");

                this.sendTouch(this.gesturePan);
            }
        }

        // -- TWO FINGERS --
        // check for SCALE & ROTATE
        if (numFingers == 2) {

            const f0 = fingers[0];
            const f1 = fingers[1];

            if (this.gestureScaleRotate == undefined) {
                this.gestureScaleRotate = new TouchGestureEvent(TouchGestureType.SCALE_ROTATE);
            }

            const g = this.gestureScaleRotate;

            const curScale = this.getDist(f0.current, f1.current) / this.getDist(f0.start, f1.start);
            g.deltaScale = (curScale - g.scale); // this.getDist(f0.current, f1.current) / (this.getDist(f0.old, f1.old) + 0.000001);
            g.scale = curScale;

            if (f0.old && f1.old) {
                const oldAngle = this.getAngle(f0.old, f1.old);
                const curAngle = this.getAngle(f0.current, f1.current);
                g.deltaRotation = (curAngle - oldAngle);

                g.srcX = (f1.current.x + f0.current.x) / 2;
                g.srcY = (f1.current.y + f0.current.y) / 2;

                g.deltaPanX = g.srcX - (f1.old.x + f0.old.x) / 2;
                g.deltaPanY = g.srcY - (f1.old.y + f0.old.y) / 2;
            }

            // g.scale += (g.deltaScale);
            if (g.scale < 0) { g.scale = 0; }
            g.rotation += g.deltaRotation;

            // console.log("%cSCALE "+g.scale+" ROT "+g.rotation, "background-color:#faa");

            this.sendTouch(this.gestureScaleRotate);

            // PAN_TWO_FINGERS
            if (this.gesturePanTwoFingers == undefined) {
                this.gesturePanTwoFingers = new TouchGestureEvent(TouchGestureType.PAN_TWO_FINGERS);
            }
        }

    }

    /*
        Handle TOUCH END
    */
    handleTouchEnd(te: TouchEvent) {

        // console.log("%cTOUCH END", 'font-weight:bolder');
        // console.log(this.fingers);
        // for (let f of this.fingers) console.log(f);

        const fingersToDelete: any[] = [];
        let numFingers = 0;
        let numFingersToDelete = 0;

        // Detect which fingers are missing
        for (const id in this.fingers) {
            if (id) {
                let exists = false;
                // tslint:disable-next-line: prefer-for-of
                for (let i = 0; i < te.touches.length; ++i) {
                    const ct = te.touches[i];
                    if ('' + ct.identifier == id) {
                        exists = true;
                    }
                }
                if (!exists) {
                    // console.log('%cRemoving finger '+id, 'background-color:#77f');
                    fingersToDelete.push(id);
                    // delete this.fingers[id];
                    ++numFingersToDelete;
                } else {
                    ++numFingers;
                }
            }
        }

        // check for single triggered EVENTS
        for (const fid of fingersToDelete) {
            const finger = this.fingers[fid];

            const dx = finger.current.x - finger.start.x;
            const dy = finger.current.y - finger.start.y;
            const absdx = dx < 0 ? -dx : dx;
            const absdy = dy < 0 ? -dy : dy;

            // tslint:disable-next-line: max-line-length
            // console.log('%cRemoving finger duration ' + (+new Date() - finger.startMillis) + ' deltas ' + dx + ',' + dy + '  acum ' + finger.acum.x + ',' + finger.acum.y, 'background-color:#77f');

            // check for TAP
            if (+new Date() - finger.startMillis < 500 && finger.acum.x < 0.05 && finger.acum.y < 0.05) {
                // console.log("%cTAP at "+finger.start.x+", "+finger.start.y, "background-color:red");

                const gest = new TouchGestureEvent(TouchGestureType.TAP);
                gest.srcX = finger.start.x;
                gest.srcY = finger.start.y;
                gest.status = TouchGestureStatus.END;

                if (gest.srcX > 0.2 || gest.srcY > 0.1) {     // do not send if it is "close" zone
                    this.sendTouch(gest);
                }
            }

            // check for PRESS - END
            if (+new Date() - finger.startMillis >= 500 && finger.acum.x < 0.05 && finger.acum.y < 0.05) {
                // console.log("%cPRESS at "+finger.start.x+", "+finger.start.y, "background-color:red");

                const gest = new TouchGestureEvent(TouchGestureType.PRESS);
                gest.srcX = finger.start.x;
                gest.srcY = finger.start.y;
                gest.status = TouchGestureStatus.END;

                this.sendTouch(gest);
            }

            // check for SWIPE_X
            if (absdx * 0.7 > absdy && absdx > 0.2 && finger.acum.x * 0.95 < absdx) {
                // console.log("%cSWIPE X", "background-color:red");

                const gest = new TouchGestureEvent(TouchGestureType.SWIPE_X);
                gest.srcX = finger.start.x;
                gest.srcY = finger.start.y;
                gest.panX = finger.current.x - gest.srcX;
                gest.panY = finger.current.y - gest.srcY;
                gest.deltaPanX = finger.current.x - gest.srcX;
                gest.deltaPanY = finger.current.y - gest.srcY;
                gest.status = TouchGestureStatus.END;

                this.sendTouch(gest);
            }

            // check for SWIPE_Y
            if (absdy * 0.7 > absdx && absdy > 0.2 && finger.acum.y * 0.95 < absdy) {
                // console.log("%cSWIPE Y", "background-color:red");
                const gest = new TouchGestureEvent(TouchGestureType.SWIPE_Y);
                gest.srcX = finger.start.x;
                gest.srcY = finger.start.y;
                gest.panX = finger.current.x - gest.srcX;
                gest.panY = finger.current.y - gest.srcY;
                gest.deltaPanX = finger.current.x - gest.srcX;
                gest.deltaPanY = finger.current.y - gest.srcY;
                gest.status = TouchGestureStatus.END;

                this.sendTouch(gest);
            }

        }

        if (numFingers == 1 && numFingersToDelete == 1) {

            // check for END of SCALE_ROTATE and PAN_TWO_FINGERS

        }

        if (this.gesturePan) {
            this.gesturePan.status = TouchGestureStatus.END;
            // console.log("%cPAN "+JSON.stringify(this.gesturePan), "background-color:red");
            this.sendTouch(this.gesturePan);
            this.gesturePan = undefined;
        }

        if (this.gestureScaleRotate) {
            const g = this.gestureScaleRotate;
            // console.log("%cSCALE "+g.scale+" ROT "+g.rotation, "background-color:red");

            g.status = TouchGestureStatus.END;

            this.sendTouch(g);
            this.gestureScaleRotate = undefined;
        }

        // Remove fingers
        for (const fid of fingersToDelete) {
            delete this.fingers[fid];
        }
    }
}
