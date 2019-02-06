import Vue from 'vue';
import { Context } from './context';
export declare type Dict = {
    [k: string]: any;
};
export declare function Data(target: Vue, key: 'data', _: TypedPropertyDescriptor<() => Dict>): void;
export declare function Data(target: Vue, key: 'data', _: TypedPropertyDescriptor<(context: Context) => Dict>): void;
