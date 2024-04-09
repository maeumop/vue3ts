export interface EventPreventDomOption {
  to?: string | HTMLElement
  callback?: Function
  delay?: number
}
  
export interface EventPreventDomModel {
  call(opt: Function | EventPreventDomOption): Promise<void>
}
  