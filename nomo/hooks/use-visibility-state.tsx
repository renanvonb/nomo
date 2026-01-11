'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface VisibilityContextType {
    isVisible: boolean
    toggleVisibility: () => void
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined)

export function VisibilityProvider({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(true)

    // Optional: Load from localStorage if desired in the future
    useEffect(() => {
        const stored = localStorage.getItem('wallet-visibility')
        if (stored !== null) {
            setIsVisible(stored === 'true')
        }
    }, [])

    const toggleVisibility = () => {
        setIsVisible((prev) => {
            const next = !prev
            localStorage.setItem('wallet-visibility', String(next))
            return next
        })
    }

    return (
        <VisibilityContext.Provider value={{ isVisible, toggleVisibility }}>
            {children}
        </VisibilityContext.Provider>
    )
}

export function useVisibility() {
    const context = useContext(VisibilityContext)
    if (context === undefined) {
        throw new Error('useVisibility must be used within a VisibilityProvider')
    }
    return context
}
