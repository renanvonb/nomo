'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AuthSkeleton } from '@/components/ui/skeletons'

const signupSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha')
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
})

type SignupValues = z.infer<typeof signupSchema>

export default function SignupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const supabase = createClient()

    // Simulate initial loading
    useState(() => {
        const timer = setTimeout(() => setInitialLoading(false), 800)
        return () => clearTimeout(timer)
    })


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
            const { error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.name,
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (signUpError) {
                setError(signUpError.message)
                return
            }

            setSuccess(true)
        } catch (err) {
            setError('Ocorreu um erro inesperado.')
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return <AuthSkeleton />
    }

    if (success) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white p-8 font-inter">
                <div className="w-full max-w-[400px] text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground font-jakarta">
                            Verifique seu e-mail <span className="font-['Apple_Color_Emoji',_'Segoe_UI_Emoji',_'Segoe_UI_Symbol',_cursive]">📧</span>
                        </h1>
                        <p className="text-muted-foreground font-inter">
                            Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="w-full h-11 rounded-md font-inter">
                        <Link href="/login">Voltar para o login</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-screen bg-white overflow-hidden font-inter">
            {/* Left Column: Form (Signup Area - 60%) */}
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
                        <h1 className="text-2xl font-bold tracking-tight text-foreground font-jakarta">
                            Crie sua conta
                        </h1>
                        <Separator className="mt-[24px] mb-[24px] w-full opacity-50" />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[320px] space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className={cn("font-inter text-sm font-medium", errors.name && "text-destructive")}
                            >
                                Nome completo
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Seu nome"
                                className={cn(
                                    "h-11 px-4 rounded-md border-input bg-background font-inter focus:ring-1 focus:ring-ring",
                                    errors.name && "border-destructive focus-visible:ring-destructive"
                                )}
                                {...register('name')}
                                disabled={loading}
                            />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className={cn("font-inter text-sm font-medium", errors.email && "text-destructive")}
                            >
                                E-mail
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nome@exemplo.com"
                                className={cn(
                                    "h-11 px-4 rounded-md border-input bg-background font-inter focus:ring-1 focus:ring-ring",
                                    errors.email && "border-destructive focus-visible:ring-destructive"
                                )}
                                {...register('email')}
                                disabled={loading}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className={cn("font-inter text-sm font-medium", errors.password && "text-destructive")}
                            >
                                Senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={cn(
                                        "h-11 pl-4 pr-10 rounded-md border-input bg-background font-inter focus:ring-1 focus:ring-ring",
                                        errors.password && "border-destructive focus-visible:ring-destructive"
                                    )}
                                    {...register('password')}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="confirmPassword"
                                className={cn("font-inter text-sm font-medium", errors.confirmPassword && "text-destructive")}
                            >
                                Confirmar senha
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={cn(
                                        "h-11 pl-4 pr-10 rounded-md border-input bg-background font-inter focus:ring-1 focus:ring-ring",
                                        errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                                    )}
                                    {...register('confirmPassword')}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                <p className="text-xs text-destructive font-medium text-center">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 rounded-md font-bold font-inter bg-black text-white hover:bg-black/90 transition-all shadow-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Criar conta'
                            )}
                        </Button>
                    </form>
                </div>

                {/* Absolute Footer Navigation */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center w-full">
                    <p className="text-sm font-inter text-muted-foreground">
                        Já tem uma conta?{' '}
                        <Link href="/login" className="text-foreground font-semibold hover:underline decoration-2 underline-offset-4">
                            Entrar
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right Column: Visual (Brand Area - 40%) */}
            <div className="hidden md:flex md:w-[40%] relative m-4 rounded-[16px] overflow-hidden p-6">
                <Image
                    src="/image_0.png"
                    alt="Signup Visual"
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
