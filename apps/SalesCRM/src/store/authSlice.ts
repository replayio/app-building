import { appApi } from './appApi'
import { auth } from '../lib/auth'

interface UserInfo {
  id: string
  email: string
  name: string
  avatar_url: string
}

export const authApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getSession: builder.query<{ access_token: string } | null, void>({
      queryFn: async () => {
        const { data: { session } } = await auth.getSession()
        if (session) {
          return { data: { access_token: session.access_token } }
        }
        return { data: null }
      },
      providesTags: ['Session'],
    }),
    getUserInfo: builder.query<UserInfo, void>({
      query: () => 'getUserInfo',
      providesTags: ['UserInfo'],
    }),
  }),
})

export const { useGetSessionQuery, useGetUserInfoQuery } = authApi
