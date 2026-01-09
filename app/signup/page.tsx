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
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Logo } from '@/components/ui/logo'

const signupSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
})

type SignupValues = z.infer<typeof signupSchema>

export default function SignupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupValues>({
        resolver: zodResolver(signupSchema),
    })

    async function onSubmit(data: SignupValues) {
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.name,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) {
                setError(error.message)
                return
            }

            setSuccess(true)
        } catch (err) {
            setError('Ocorreu um erro inesperado.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans">
                <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-6">
                            <Logo variant="symbol" size={48} className="text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">Verifique seu e-mail</CardTitle>
                        <CardDescription className="text-zinc-400 mt-2">
                            Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada para ativar sua conta.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild variant="outline" className="w-full border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800">
                            <Link href="/login">Voltar para o login</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 font-sans">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex items-center mb-6">
                        <Link href="/login" className="text-zinc-500 hover:text-white transition-colors flex items-center text-sm font-medium group">
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Voltar
                        </Link>
                    </div>
                    <div className="flex justify-center mb-4">
                        <Logo variant="full" size={40} className="text-white" />
                    </div>
                    <CardDescription className="text-zinc-400">
                        Preencha os dados abaixo para começar no Nomo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-300">
                                Nome Completo
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Seu nome"
                                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700 h-11 rounded-xl"
                                {...register('name')}
                                disabled={loading}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-500">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">
                                E-mail
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@exemplo.com"
                                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700 h-11 rounded-xl"
                                {...register('email')}
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" title="password" className="text-zinc-300">
                                Senha
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700 h-11 rounded-xl"
                                {...register('password')}
                                disabled={loading}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" title="confirmPassword" className="text-zinc-300">
                                Confirmar Senha
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700 h-11 rounded-xl"
                                {...register('confirmPassword')}
                                disabled={loading}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                        {error && (
                            <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20">
                                <p className="text-center text-sm text-red-500 font-medium">{error}</p>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-white text-zinc-950 hover:bg-zinc-200 h-12 rounded-xl font-bold mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                'Criar Conta'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t border-zinc-800 pt-6">
                    <div className="text-center text-sm text-zinc-500">
                        Já tem uma conta?{' '}
                        <Link
                            href="/login"
                            className="text-white hover:underline transition-all font-medium"
                        >
                            Entre agora
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
