"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark") {
      document.documentElement.classList.add("dark")
      setDark(true)
    }
  }, [])

  const toggle = () => {
    const el = document.documentElement
    const willDark = !el.classList.contains("dark")
    el.classList.toggle("dark", willDark)
    localStorage.setItem("theme", willDark ? "dark" : "light")
    setDark(willDark)
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      {dark ? "Modo claro" : "Modo oscuro"}
    </Button>
  )
}
