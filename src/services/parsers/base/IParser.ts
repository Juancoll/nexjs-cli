export interface IParser<TInput, TOutput> {
    parse(value: TInput): TOutput;
}