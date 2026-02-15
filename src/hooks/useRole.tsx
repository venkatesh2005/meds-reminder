"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"

type UserRole = "patient" | "caretaker"

interface RoleContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  toggleRole: () => void
}

const RoleContext = createContext<RoleContextType | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("patient")

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole
    if (savedRole === "patient" || savedRole === "caretaker") {
      setRoleState(savedRole)
    }
  }, [])

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole)
    localStorage.setItem("userRole", newRole)
  }

  const toggleRole = () => {
    const newRole = role === "patient" ? "caretaker" : "patient"
    setRole(newRole)
  }

  return (
    <RoleContext.Provider value={{ role, setRole, toggleRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
