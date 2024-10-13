import { AccountType } from "./types"

export class UnsupportedAccountTypeError extends Error {
  constructor(type: AccountType) {
    super(`Unsupported account type: ${type}`)
  }
}
export class InvalidLoginDataError extends Error {
  constructor() {
    super('Your token is not valid or may have expired.')
  }
}
