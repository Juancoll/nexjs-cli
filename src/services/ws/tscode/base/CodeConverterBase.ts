import { TSCode } from '../TSCode'

export abstract class CodeConverterBase<TInput, TOutput> {
    //#region  [ properties ]
    public readonly ts: TSCode;
    //#endregion

    //#region [ constructor ]
    constructor ( ts: TSCode ) {
        this.ts = ts
    }
    //#endregion

    //#region [ abstract ]
    public abstract convert( input: TInput ): TOutput;
    //#endregion
}