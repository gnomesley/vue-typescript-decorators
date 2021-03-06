import Vue from 'vue'

import {Component} from './core'
import {$$Prop} from './interface'
import {createMap} from './util'

const LIFECYCLE_KEY = '$$Lifecycle' as $$Prop

export type Lifecycles =
  'beforeCreate' | 'created' |
  'beforeDestroy' | 'destroyed' |
  'beforeMount' | 'mounted' |
  'beforeUpdate' | 'updated' |
  'activated' | 'deactivated' |
  'beforeRouteEnter' | 'beforeRouteLeave' | 'beforeRouteUpdate'

export type LifecycleDecorator = (target: Vue, method: string) => void
export function Lifecycle(life: Lifecycles): LifecycleDecorator
export function Lifecycle(target: Vue, life: Lifecycles): void
export function Lifecycle(target: Vue | Lifecycles, life?: Lifecycles): LifecycleDecorator | void {
  function makeDecorator(life: Lifecycles): LifecycleDecorator {
    return (target: Vue, method: string) => {
      let lifecycles = target[LIFECYCLE_KEY] = target[LIFECYCLE_KEY] || createMap()
      lifecycles[life] = lifecycles[life] || []
      lifecycles[life].push(method)
    }
  }

  if (target instanceof Vue) {
    return makeDecorator(life!)(target, life!)
  } else {
    return makeDecorator(target)
  }
}

Component.register(LIFECYCLE_KEY, function(proto, instance, options) {
  let lifecycles: string[][] = proto[LIFECYCLE_KEY]
  for (let lifecycle in lifecycles) {
    // lifecycles must be on proto because internalKeys is processed before method
    let methods: string[] = lifecycles[lifecycle]
    // delete proto[lifecycle]
    options[lifecycle] = function(this: Vue) {
      let _this = this
      let args = arguments
      // console.log(this)
      methods.forEach(function(method: string) {
        let _v = _this || instance || proto
        // this[method] does not exist on beforeCreate
        if (_v[method]) {
          _v[method].apply(_v, args)
        } else if (_v['$options']) {
          // but maybe we could just always do this one?
          _v['$options'].methods![method].apply(_v, args)()
        }
      })
    }
  }
})
