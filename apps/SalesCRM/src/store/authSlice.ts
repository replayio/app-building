import { appApi } from './appApi'

interface UserInfo {
  id: string
  email: string
  name: string
  avatar_url: string
}

export const authApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserInfo: builder.query<UserInfo, void>({
      query: () => 'auth?action=me',
      providesTags: ['UserInfo'],
    }),
  }),
})

export const { useGetUserInfoQuery } = authApi
