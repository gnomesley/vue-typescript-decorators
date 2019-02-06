import Vue from 'vue';
export declare type Lifecycles = 'beforeCreate' | 'created' | 'beforeDestroy' | 'destroyed' | 'beforeMount' | 'mounted' | 'beforeUpdate' | 'updated' | 'activated' | 'deactivated' | 'beforeRouteEnter' | 'beforeRouteLeave' | 'beforeRouteUpdate';
export declare type LifecycleDecorator = (target: Vue, method: string) => void;
export declare function Lifecycle(life: Lifecycles): LifecycleDecorator;
export declare function Lifecycle(target: Vue, life: Lifecycles): void;
