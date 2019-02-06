import { VClass } from './interface';
import Vue from 'vue';
export declare function Mix<T extends Vue>(parent: typeof Vue, ...mixins: (typeof Vue)[]): VClass<T>;
