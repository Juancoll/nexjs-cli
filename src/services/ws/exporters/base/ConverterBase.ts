export abstract class ConverterBase<TParent, TInput, TOutput> {
    //#region [ abstract ]
    abstract convert( input: TInput ): TOutput;
    //#endregion

    //#region [ properties ]
    parent: TParent;
    //#endregion

    //#region [ constructor ]
    constructor ( parent: TParent ) {
        this.parent = parent
    }
    //#endregion
}