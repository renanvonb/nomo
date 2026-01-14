export type TransactionType = 'revenue' | 'expense' | 'investment';
export type TransactionClassification = 'essential' | 'necessary' | 'superfluous';

export interface Payer {
    id: string;
    name: string;
    created_at: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    created_at: string;
}

export interface Payee {
    id: string;
    name: string;
    type?: string;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    created_at: string;
}

export interface Subcategory {
    id: string;
    name: string;
    category_id: string;
    created_at: string;
}

export interface Wallet {
    id: string;
    name: string;
    logo_url?: string;
    color?: string;
    icon?: string;
    is_principal: boolean;
    created_at: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    description: string;
    amount: number;
    type: TransactionType;
    payer_id?: string;
    payee_id?: string;
    payment_method_id?: string;
    classification: TransactionClassification;
    category_id?: string;
    subcategory_id?: string;
    due_date: string;
    payment_date?: string;
    is_installment: boolean;
    wallet_id?: string;
    competence_date?: string;
    observation?: string;
    status?: string;
    created_at: string;
    updated_at: string;
    // Joined relations
    payers?: Payer;
    payees?: Payee;
    payment_methods?: PaymentMethod;
    categories?: Category;
    subcategories?: Subcategory;
    wallets?: Wallet;
}

export interface CreateTransactionInput {
    description: string;
    amount: number;
    type: TransactionType;
    payer_id?: string;
    payee_id?: string;
    payment_method_id?: string;
    classification: TransactionClassification;
    category_id?: string;
    subcategory_id?: string;
    due_date: string;
    payment_date?: string;
    is_installment: boolean;
    wallet_id?: string;
    competence_date?: string;
    observation?: string;
    status?: string;
}
