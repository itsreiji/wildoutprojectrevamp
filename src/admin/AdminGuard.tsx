// This component needs proper implementation
// Currently commented out due to missing dependencies
/*
import { useAuth } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
    const { data, error } = useAuth()
    const router = useRouter()

    if (!data?.user?.role?.includes('admin')) {
        router.push('/login')
        return null
    }

    return children
}
*/