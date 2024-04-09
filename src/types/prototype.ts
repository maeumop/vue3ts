declare global {
  interface String {
    patternCheck(flag: string): boolean
    nl2br(): string
    numberFormat(): string
    fileSize(): string
    phoneNumber(): string
    companySerial(): string
    josaFormat(formats?: string[]): string
    firstWordUpperCase(): string
  }

  interface Number {
    numberFormat(): string
    fileSize(fixed: number): string
  }
}

export {};