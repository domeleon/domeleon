import * as Vue from 'vue'
import type { PropType } from 'vue'
import type { VueComponentConfig } from './index.js'

// --- ComposableAdapter Section  ---

const composableAdapterProps = {
    tag: { type: String, required: true },
    hookFn: { type: Function as PropType<(options: any) => any>, required: true },
    hookOptions: { type: Object, required: false, default: () => ({}) },
    elementProps: { type: Object as PropType<Record<string, any>>, required: true },
    elementChildren: { type: Array as PropType<any[]>, required: true }
}

export interface ComposableAdapterProps {
    key?: string | number
    tag: string
    hookFn: (options: any) => any
    hookOptions?: Record<string, any>
    elementProps: Record<string, any>
    elementChildren: any[]
}

export const ComposableAdapter = Vue.defineComponent({
    name: 'ComposableAdapter',
    props: composableAdapterProps,
    setup(props: ComposableAdapterProps) {
        if (props.hookFn) {
            props.hookFn(props.hookOptions)            
        }
        return () => Vue.h(
            props.tag || 'div',
            props.elementProps,
            props.elementChildren
        )
    }
})

// --- ComponentAdapter Section ---

const componentAdapterProps = {
    componentConfig: { type: Object as PropType<VueComponentConfig>, required: true },
    elementProps: { type: Object as PropType<Record<string, any>>, required: true },
    elementChildren: { type: Array as PropType<any[]>, required: true }
}

export interface ComponentAdapterProps {
    componentConfig: VueComponentConfig
    elementProps: Record<string, any>
    elementChildren: any[]
}

export const ComponentAdapter = Vue.defineComponent({
    name: 'ComponentAdapter',
    props: componentAdapterProps,
    render(props: ComponentAdapterProps) {
        const { component: TargetComponent, componentProps = {} } = props.componentConfig        
        const mergedProps = { ...componentProps, ...props.elementProps } 
        const slots = { default: () => props.elementChildren }            
        return Vue.h(TargetComponent, mergedProps, slots)
    }
}) 