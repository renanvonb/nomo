'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

import { Logo } from '@/components/ui/logo'

const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    async function onSubmit(data: LoginValues) {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (error) {
                setError('E-mail ou senha incorretos.')
                return
            }

            router.push('/')
            router.refresh()
        } catch (err) {
            setError('Ocorreu um erro inesperado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center py-8">
                    <div className="flex justify-center mb-4">
                        <Logo variant="full" size={40} className="text-white" />
                    </div>
                    <CardDescription className="text-zinc-400 font-medium pt-2">
                        Acesse sua conta para gerenciar seu financeiro
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300 text-sm font-semibold ml-1">
                                E-mail
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@exemplo.com"
                                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-700 h-12 px-4 focus-visible:ring-zinc-700 rounded-xl"
                                {...register('email')}
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <Label htmlFor="password" title="password" className="text-zinc-300 text-sm font-semibold">
                                    Senha
                                </Label>
                                <button type="button" className="text-xs text-zinc-500 hover:text-white transition-colors">
                                    Esqueceu a senha?
                                </button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-700 h-12 px-4 focus-visible:ring-zinc-700 rounded-xl"
                                {...register('password')}
                                disabled={loading}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>
                            )}
                        </div>
                        {error && (
                            <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20 my-2">
                                <p className="text-center text-sm text-red-500 font-bold">{error}</p>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-white text-zinc-950 hover:bg-zinc-200 h-12 rounded-xl font-extrabold text-base shadow-lg shadow-white/5 active:scale-[0.98] transition-all mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Autenticando...
                                </>
                            ) : (
                                'Entrar no Nomo'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t border-zinc-800 mt-4 pt-6 text-center">
                    <div className="text-sm text-zinc-500">
                        Ainda não faz parte?{' '}
                        <button
                            onClick={() => router.push('/signup')}
                            className="text-white hover:underline transition-all font-bold"
                        >
                            Crie sua conta grátis
                        </button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
