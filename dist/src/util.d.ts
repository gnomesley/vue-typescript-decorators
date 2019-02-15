export declare function NOOP(): void;
export declare function getReflectType(target: Object, key: string): any;
export interface Map<T> {
    [k: string]: T;
}
export declare function createMap<T>(): Map<T>;
export declare function hasOwn(obj: Object, key: string): any;
export declare function objAssign<T, U, V>(target: T, source1: U, source2?: V): T & U & V;
export declare const makeObject: (obj: any) => (key: string) => {
    [x: string]: any;
};
export declare module global {
}
