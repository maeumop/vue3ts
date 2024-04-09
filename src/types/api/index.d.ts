export interface ResponseDefault<T> {
  code: T
  message: string
}

export interface PaginationDefault {
  cursor?: number | string
  limit?: number
}
