
export type AccountType = 'google' | 'apple' | 'facebook' | 'bot'

export type StepUpInit = {
  auth: {
    type: AccountType,
    token: string
  },
  api?: {
    url?: string,
    endingPathname?: string
  }
}

export type ApiUser = {
  email: string
  emailVerified: string
  name: string
  picture: string
  givenName: string
  id: string,
  expiry: number
}

export type User = {
  id: string
  firstName: string
  lastName: string
  type: AccountType
  profilePictureUrl?: string
}

export type UserGroup = {
  id: string
  name: string
  role: 'admin' | string
}

export type UserScoreOneDay = {
  id: string
  steps: number
  calories: number
  distance: number
  isFinal: boolean,
  dateTime: Date | ''
}

export type Leaderboard = {
  day: 'today' | 'yesterday' | 'last7days' | 'month',
  date: string
  data: Array<UserScoreOneDay>,
  totalSteps: number
}

export type ActivityResponse = {
  leaderbord: Array<Leaderboard>,
  unreadAlertsCount: number,
  userGroups: Array<UserGroup>,
  users: Array<User>,
  success: true
} | {
  success: false,
  error: string,
  status: number
}
