import { AlertCircle, Database } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface MigrationRequiredAlertProps {
    tableName: string;
    migrationFile?: string;
}

export function MigrationRequiredAlert({
    tableName,
    migrationFile = '007_categories_subcategories.sql'
}: MigrationRequiredAlertProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <Alert className="max-w-2xl border-amber-500 bg-amber-50">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-900 font-jakarta text-lg">
                    Migração de Banco de Dados Necessária
                </AlertTitle>
                <AlertDescription className="text-amber-800 font-inter mt-2 space-y-3">
                    <p>
                        A tabela <code className="bg-amber-100 px-2 py-1 rounded font-mono text-sm">{tableName}</code> não foi encontrada ou está desatualizada.
                    </p>

                    <div className="bg-white border border-amber-200 rounded-lg p-4 mt-3">
                        <p className="font-semibold mb-2 flex items-center gap-2">
                            <Database className="w-4 h-4" />
                            Como resolver:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Acesse o <strong>Supabase Dashboard</strong></li>
                            <li>Vá em <strong>SQL Editor</strong> (menu lateral)</li>
                            <li>Clique em <strong>New Query</strong></li>
                            <li>
                                Copie e cole o conteúdo do arquivo:{' '}
                                <code className="bg-zinc-100 px-2 py-1 rounded font-mono text-xs">
                                    database/migrations/{migrationFile}
                                </code>
                            </li>
                            <li>Clique em <strong>Run</strong> ou pressione <kbd className="bg-zinc-100 px-2 py-1 rounded text-xs">Ctrl+Enter</kbd></li>
                            <li>Recarregue esta página</li>
                        </ol>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                            className="font-inter"
                        >
                            Abrir Supabase Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.reload()}
                            className="font-inter"
                        >
                            Recarregar Página
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
}
