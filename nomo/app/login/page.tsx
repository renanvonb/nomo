'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthSkeleton } from '@/components/ui/skeletons'

const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const supabase = createClient()

    // Simulate initial loading or handle auth check
    useState(() => {
        const timer = setTimeout(() => setInitialLoading(false), 800)
        return () => clearTimeout(timer)
    })


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

    if (initialLoading) {
        return <AuthSkeleton />
    }

    return (
        <div className="flex h-screen font-sans bg-background overflow-hidden">
            {/* Left Column: Form (Login Area - 60%) */}
            <div className="flex-1 md:w-[60%] md:flex-none flex flex-col items-center justify-center p-8 md:p-12 lg:p-16 bg-white relative">
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-[320px] flex flex-col items-center text-center">
                        {/* Brand Symbol */}
                        <div className="relative h-10 w-10 mb-4">
                            <Image
                                src="/brand/symbol.png"
                                alt="Sollyd"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground font-jakarta mb-2">
                            Bem-vindo! <span className="font-['Apple_Color_Emoji',_'Segoe_UI_Emoji',_'Segoe_UI_Symbol',_cursive]">👋🏻</span>
                        </h1>
                        <p className="text-muted-foreground font-inter">
                            Insira suas credenciais abaixo.
                        </p>
                        <Separator className="mt-[24px] mb-[24px] w-full opacity-50" />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[320px] space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    errors.email && "text-destructive"
                                )}
                            >
                                E-mail
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                className={cn(
                                    "h-11 rounded-lg border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                    errors.email && "border-destructive focus-visible:ring-destructive"
                                )}
                                {...register('email')}
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className={cn(
                                        "text-sm font-medium transition-colors",
                                        errors.password && "text-destructive"
                                    )}
                                >
                                    Senha
                                </Label>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Sua senha"
                                    className={cn(
                                        "h-11 rounded-lg border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10",
                                        errors.password && "border-destructive focus-visible:ring-destructive"
                                    )}
                                    {...register('password')}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3 border border-destructive/20 text-center">
                                <p className="text-sm text-destructive font-medium">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                className="w-full h-11 rounded-lg font-semibold shadow-sm transition-all active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>

                            <div className="text-center">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm font-medium text-primary hover:underline transition-all"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="absolute bottom-8 w-full text-center">
                    <p className="text-sm text-muted-foreground">
                        Não tem uma conta?{' '}
                        <Link
                            href="/signup"
                            className="font-semibold text-primary hover:underline transition-all"
                        >
                            Crie agora
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Column: Visual (Brand Area - 40%) */}
            <div className="hidden md:flex md:w-[40%] relative m-4 rounded-[16px] overflow-hidden p-6">
                <Image
                    src="/image_0.png"
                    alt="Login Visual"
                    fill
                    className="object-cover"
                    priority
                />

                {/* Brand Logo in top-left of the card */}
                <div className="absolute top-6 left-6 z-20">
                    <span className="text-2xl font-bold font-jakarta tracking-tight text-white">Sollyd</span>
                </div>

                {/* Bottom Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />

                {/* Slogan Container (No glassmorphism now) */}
                <div className="absolute bottom-24 left-12 right-12 text-white z-20 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                    <h2 className="text-3xl font-bold mb-3 font-jakarta shadow-2xl">Simplicidade e Eficiência</h2>
                    <p className="text-white/90 text-lg max-w-md">
                        Gerencie suas finanças e documentos em um só lugar com a melhor experiência.
                    </p>
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-6 left-6 z-20">
                    <p className="font-inter text-[14px] text-white/80 font-medium">
                        © 2025 Sollyd. Todos os direitos reservados
                    </p>
                </div>
            </div>
        </div>
    )
}
