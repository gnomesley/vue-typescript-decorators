import Vue from 'vue'
import './src/global'

export {Component} from './src/core'
export {Lifecycle} from './src/lifecycle'
export {Prop, resultOf} from './src/prop'
export {Render} from './src/render'
export {Transition} from './src/transition'
export {Filter} from './src/filter'
export {Watch} from './src/watch'
export {Data} from './src/data'
export {State, Getter, Action, Mutation, namespace} from './src/vuex'
export * from './src/functions'
export * from './src/aliases'
export * from './src/context'

export type CreateElement = typeof Vue.prototype.$createElement
export { Vue }
