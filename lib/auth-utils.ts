import { createClient } from "@/lib/supabase/server"

/**
 * Obtém o ID do usuário atual, respeitando o modo de desenvolvimento.
 * Se estiver em dev e não houver sessão ativa, retorna o ID do primeiro usuário do banco.
 */
export async function getCurrentUserId(): Promise<string> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) return user.id

    // Fallback para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        const { data: users, error } = await supabase
            .from('profiles') // Ou qualquer tabela que contenha IDs de usuários
            .select('id')
            .limit(1)

        // Se profiles falhar, tenta buscar diretamente da auth.users (necessário service_role ou bypass RLS se configurado)
        // Como estamos em Server Action, podemos tentar uma rota que não dependa de RLS se o client for admin, 
        // mas aqui vamos assumir que o usuário quer um ID válido para os mocks.

        // Tentativa de buscar ID estável para o mock admin@nomo.com.br
        const { data: authUser } = await supabase.rpc('get_user_id_by_email', { email_query: 'admin@nomo.com.br' })
        if (authUser) return authUser

        if (users && users.length > 0) return users[0].id
    }

    throw new Error('Usuário não autenticado')
}
