import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchUser, clearCurrent } from '../store/slices/usersSlice'
import UserDetailHeader from '../components/Users/UserDetailHeader'
import UserDetailStats from '../components/Users/UserDetailStats'
import UserDealsList from '../components/Users/UserDealsList'
import UserTasksList from '../components/Users/UserTasksList'
import UserActivityFeed from '../components/Users/UserActivityFeed'

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const dispatch = useAppDispatch()
  const { current: user, loading } = useAppSelector((state) => state.users)

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(userId))
    }
    return () => {
      dispatch(clearCurrent())
    }
  }, [dispatch, userId])

  if (loading) {
    return (
      <div data-testid="user-detail-page" className="p-6 max-sm:p-3">
        <div data-testid="user-detail-loading" className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div data-testid="user-detail-page" className="p-6 max-sm:p-3">
        <p className="text-[13px] text-[var(--color-text-muted)]">User not found</p>
      </div>
    )
  }

  return (
    <div data-testid="user-detail-page" className="p-6 max-sm:p-3">
      <UserDetailHeader user={user} />
      <UserDetailStats user={user} />
      <UserDealsList deals={user.deals || []} />
      <UserTasksList tasks={user.tasks || []} />
      <UserActivityFeed activity={user.activity || []} />
    </div>
  )
}
