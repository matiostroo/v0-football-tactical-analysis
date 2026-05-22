import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Mail, Target } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
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
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Registro Exitoso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-100 rounded-lg p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-600 mt-0.5" />
              <div className="text-left">
                <p className="text-slate-700 font-medium">Verificá tu email</p>
                <p className="text-slate-600 text-sm mt-1">
                  Te enviamos un enlace de confirmación. Revisá tu bandeja de entrada para activar tu cuenta.
                </p>
              </div>
            </div>
            
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/auth/login">
                Ir al Login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
