import Vue from 'vue';
import { PropOptions } from './interface';
export declare type Constructor = new (...args: any[]) => any;
export declare type PropDec = (target: Vue, key: string) => void;
export declare function Prop(...types: Constructor[]): PropDec;
export declare function Prop(options: PropOptions): PropDec;
export declare function Prop(target: Vue, key: string): void;
export declare function resultOf<T>(fn: () => T): T;
