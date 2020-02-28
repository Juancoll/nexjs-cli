import { SimpleEventDispatcher } from 'strongly-typed-events';

export abstract class StateClassBase<TState> {
    private _state: TState;
    public get state() {
        return this._state;
    }
    public onStateUpdate = new SimpleEventDispatcher<TState>();

    constructor() {
        this._state = this.initializeState();
    }

    protected abstract initializeState(): TState;
    public setState(updates: Partial<TState>) {
        this._state = Object.assign({}, this._state, updates);
        this.onStateUpdate.dispatch(this._state);
    }
    public notifyStateUpdate() {
        this.onStateUpdate.dispatch(this._state);
    }
}
