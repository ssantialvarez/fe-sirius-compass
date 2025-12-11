import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const authParam = searchParams?.authentication
  const authValue = Array.isArray(authParam) ? authParam[0] : authParam
  const isAuthError = authValue === "true"

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle>{isAuthError ? "Acceso denegado" : "Ocurrió un error"}</CardTitle>
          <CardDescription>
            {isAuthError
              ? "No se permiten usuarios sin el dominio @sirius.com.ar. Por favor, ingresa con una cuenta de correo @sirius.com.ar."
              : "Ha ocurrido un error durante el proceso de autenticación. Por favor, intenta nuevamente."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex gap-3 items-center">
            <Button variant="outline" asChild>
              <Link href="/auth/logout">Ir al inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
