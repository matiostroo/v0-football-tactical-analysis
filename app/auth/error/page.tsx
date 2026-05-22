import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Target } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">TacticAI</span>
        </div>

        <Card className="border-0 shadow-xl text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Error de Autenticación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-600">
              Hubo un problema al procesar tu solicitud. Por favor, intentá de nuevo.
            </p>
            
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/auth/login">
                  Iniciar Sesión
                </Link>
              </Button>
              <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Link href="/auth/sign-up">
                  Registrarse
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
