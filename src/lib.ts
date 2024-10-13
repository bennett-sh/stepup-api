import type { AccountType, ActivityResponse, ApiUser, Leaderboard, StepUpAPIInit } from './types.js'
import { InvalidLoginDataError, UnsupportedAccountTypeError } from './errors.js'
import { decode } from 'jsonwebtoken'

export * from './errors.js'
export * as types from './types.js'

export function getApiUserFromToken(token: string): ApiUser | null {
  const data = decode(token)

  if(typeof data === 'string') return null

  return {
    email: data.email,
    emailVerified: data.email_verified,
    name: data.name,
    picture: data.picture,
    givenName: data.given_name,
    id: data.sub,
    expiry: data.exp
  }
}

export class StepUpAPI {
  private auth: StepUpAPIInit['auth']
  private user: ApiUser | null = null

  private apiUrl = 'https://stepup-api.azurewebsites.net'
  private apiEndingPathname = 'd05f8abd-9b4b-489f-837e-acbc86477b66'

  public constructor(init: StepUpAPIInit) {
    this.login(init.auth.type, init.auth.token)

    this.apiUrl ??= init.api?.url
    this.apiEndingPathname ??= init.api?.endingPathname
  }

  private login(type: AccountType, token: string) {
    if(type === 'facebook' || type === 'bot') throw new UnsupportedAccountTypeError(type)
    this.auth = { type, token }

    const user = getApiUserFromToken(token)
    if(!user || user.expiry > Date.now()) throw new InvalidLoginDataError()
    this.user = user
  }

  private fetchApi(
    endpoint: string,
    options: RequestInit
              & {
                  body?: any,
                  search?: URLSearchParams | {[key: string]: string}
                }
  ) {
    const search = options.search instanceof URLSearchParams ? options.search : new URLSearchParams(
      Object.fromEntries(
        Object.entries(options.search ?? {})
          .map(([k, v]) => [k, encodeURIComponent(v.toString())]
        )
      )
    )
    const url = `${this.apiUrl}/${endpoint}/${this.apiEndingPathname}?${search.toString()}`
    const isJSONBody = options.body && typeof options.body !== 'string'
  
    return fetch(url, {
      ...options,
      headers: {
        ...(isJSONBody ? { 'Content-Type': 'application/json' } : {}),
        userid: this.user.id,
        usertoken: this.auth.token,
        usertype: this.auth.type,
        'User-Agent': 'okhttp/4.9.3.6',
        ...options.headers
      },
      body: isJSONBody ? JSON.stringify(options.body) : options.body
    })
  }

  private post(
    endpoint: string,
    options: {
      search?: URLSearchParams | {[key: string]: any},
      body?: any
    }
  ) {
    return this.fetchApi(endpoint, {
      method: 'POST',
      ...options
    })
  }

  public async nudge(options: {
    expression: 'nudge' | 'cheer' | 'taunt',
    recipientId: string,
    recipientType: string,
    message: string
  }): Promise<boolean> {
    const response = await this.post('poke', {
      body: {
        action: options.expression,
        id: options.recipientId,
        type: options.recipientType,
        message: options.message
      }
    })

    return response.status > 199 && response.status < 300
  }

  public async activity(options: {
    steps: number,
    calories: number,
    distance: number,
    history?: Array<any>,
    leaderboard?: Array<Leaderboard>
  }): Promise<ActivityResponse> {
    const response = await this.post('activity/v2', {
      search: {
        steps: options.steps,
        calories: options.calories,
        distance: options.distance,
        bg: false // prevents blocking
      },
      body: {
        history: options.history ?? [],
        leaderboard: options.leaderboard ?? []
      }
    })

    if(response.status >= 200 && response.status <= 299) {
      const json = await response.json()
      return {
        success: true,
        leaderbord: json.leaderbord?.map?.(board => ({
          ...board,
          data: board.data.map(day => ({
            ...day,
            dateTime: new Date(decodeURIComponent(day.dateTime))
          }))
        })),
        ...json
      }
    }

    return {
      success: false,
      error: await response.text(),
      status: response.status
    }
  }

  public get me(): ApiUser | null {
    return this.user
  }
}
