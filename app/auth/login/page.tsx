'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BarChart3, Shield, Target } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Admin quick login
    if (email === 'aadmin' && password === 'aadmin') {
      router.push('/dashboard')
      return
    }

    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TacticAI</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white leading-tight text-balance">
            Análisis táctico inteligente para equipos de fútbol profesional
          </h1>
          <p className="mt-6 text-slate-400 text-lg">
            Potenciá tu cuerpo técnico con inteligencia artificial y machine learning para tomar mejores decisiones en cada partido.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-6">
            <BarChart3 className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className="text-white font-semibold">Análisis de Rivales</h3>
            <p className="text-slate-400 text-sm mt-1">Fortalezas, debilidades y patrones tácticos detallados</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6">
            <Shield className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className="text-white font-semibold">Simulaciones</h3>
            <p className="text-slate-400 text-sm mt-1">Probá distintas tácticas y escenarios antes del partido</p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 md:p-10 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">TacticAI</span>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-slate-900">Iniciar Sesión</CardTitle>
              <CardDescription className="text-slate-600">
                Ingresá a tu panel de análisis táctico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700">Email</Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="tu@email.com o aadmin"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Ingresando...' : 'Ingresar'}
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm text-slate-600">
                  ¿No tenés cuenta?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-4"
                  >
                    Registrate
                  </Link>
                </div>
                <div className="mt-4 text-center">
                  <Link
                    href="/dashboard"
                    className="text-sm text-slate-500 hover:text-emerald-600 transition-colors"
                  >
                    Ver demo sin registrarse
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
