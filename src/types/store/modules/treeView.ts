export interface TreeViewOption {
  title: string
  children?: TreeViewOption[]
}

export interface TreeViewItemOption extends TreeViewOption {
  opend: boolean
  active: boolean
  depth: number
  children?: TreeViewItemOption[]
}
