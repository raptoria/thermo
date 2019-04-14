export interface ITestResults {
    [key:string]: IResult;
}

export enum IResult {
    Precise = 'precise',
    UltraPrecise = 'ultra precise',
    Keep = 'keep',
    Discard = 'discard'
}