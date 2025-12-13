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
          <CardTitle>{isAuthError ? "Access Denied" : "An Error Occurred"}</CardTitle>
          <CardDescription>
            {isAuthError
              ? "User must have an @sirius.com.ar email address. Please sign in with an @sirius.com.ar account."
              : "An error occurred during the authentication process. Please try again."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex gap-3 items-center">
            <Button variant="outline" asChild>
              <Link href="/auth/logout">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
