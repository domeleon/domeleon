import type { Component } from "./component.js"

export type ComponentState = "detached" | "updating" | "rendered"

export type UpdateCause = "input" | "validator" | "router" | "serializer"

export interface UpdateEvent {
  component: Component
  cause?: UpdateCause | string
  key?: string
  value?: any
}  

export interface IApp {
  update(event: UpdateEvent): void
}