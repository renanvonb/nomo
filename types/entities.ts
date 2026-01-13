// =====================================================
// SOLLYD - TIPOS DE ENTIDADES DE CADASTROS
// =====================================================

export interface Wallet {
    id: string;
    user_id: string;
    name: string;
    color: string;
    logo?: string;
    balance?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Payer {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface Beneficiary {
    id: string;
    user_id: string;
    name: string;
    classification_id?: string;
    icon: string;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    description: string;
    classification_id?: string;
    icon: string;
    color: string;
    created_at: string;
    updated_at: string;
    // Propriedades computadas
    subcategories_count?: number;
    classifications?: Classification;
}

export interface Subcategory {
    id: string;
    user_id: string;
    category_id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Classification {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    color: string;
    icon: string;
    created_at: string;
    updated_at: string;
}
