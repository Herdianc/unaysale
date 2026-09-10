"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"

interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
}

interface Session {
  user: SessionUser
  expires: string
}

interface SessionContextType {
  session: Session | null
  status: "loading" | "authenticated" | "unauthenticated"
  refresh: () => void
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  status: "loading",
  refresh: () => {},
})

export function useSessionContext() {
  return useContext(SessionContext)
}

export function CustomSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session")
      const data = await res.json()
      if (data && data.user) {
        setSession(data)
        setStatus("authenticated")
      } else {
        setSession(null)
        setStatus("unauthenticated")
      }
    } catch {
      setSession(null)
      setStatus("unauthenticated")
    }
  }, [])

  useEffect(() => {
    fetchSession()
    const interval = setInterval(fetchSession, 60000)
    return () => clearInterval(interval)
  }, [fetchSession])

  return (
    <SessionContext.Provider value={{ session, status, refresh: fetchSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useCustomSession() {
  return useContext(SessionContext)
}
