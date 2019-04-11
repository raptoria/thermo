export interface ISensorResult {
    [key:string]: IResult;
}

export enum IResult {
    Precise = 'precise',
    UltraPrecise = 'ultra precise',
    Keep = 'keep',
    Discard = 'discard'
}