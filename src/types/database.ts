export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_financeiro_cache: {
        Row: {
          assinantes_cortesia: number
          assinantes_pagantes: number
          historico_mensal: Json
          id: string
          mrr: number
          recebido_mes: number
          updated_at: string
        }
        Insert: {
          assinantes_cortesia?: number
          assinantes_pagantes?: number
          historico_mensal?: Json
          id?: string
          mrr?: number
          recebido_mes?: number
          updated_at?: string
        }
        Update: {
          assinantes_cortesia?: number
          assinantes_pagantes?: number
          historico_mensal?: Json
          id?: string
          mrr?: number
          recebido_mes?: number
          updated_at?: string
        }
        Relationships: []
      }
      anamnese_fotos: {
        Row: {
          anamnese_id: string
          created_at: string
          id: string
          owner_id: string
          url: string
        }
        Insert: {
          anamnese_id: string
          created_at?: string
          id?: string
          owner_id: string
          url: string
        }
        Update: {
          anamnese_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamnese_fotos_anamnese_id_fkey"
            columns: ["anamnese_id"]
            isOneToOne: false
            referencedRelation: "anamneses"
            referencedColumns: ["id"]
          },
        ]
      }
      anamneses: {
        Row: {
          alteracoes_lesoes: Json
          alteracoes_pele: Json
          assinatura_paciente_url: string | null
          assinatura_profissional_url: string | null
          autorizacao_uso_imagem: boolean
          cliente_id: string
          created_at: string
          dados_clinicos: Json
          dados_gerais: Json
          dados_pessoais: Json
          data: string
          data_retorno: string | null
          deleted_at: string | null
          deleted_via_cliente: boolean
          formato_unhas: Json
          id: string
          observacoes_clinicas: string | null
          orientacao: string | null
          owner_id: string
          procedimentos_realizados: string | null
          status: string
          updated_at: string
        }
        Insert: {
          alteracoes_lesoes?: Json
          alteracoes_pele?: Json
          assinatura_paciente_url?: string | null
          assinatura_profissional_url?: string | null
          autorizacao_uso_imagem?: boolean
          cliente_id: string
          created_at?: string
          dados_clinicos?: Json
          dados_gerais?: Json
          dados_pessoais?: Json
          data?: string
          data_retorno?: string | null
          deleted_at?: string | null
          deleted_via_cliente?: boolean
          formato_unhas?: Json
          id?: string
          observacoes_clinicas?: string | null
          orientacao?: string | null
          owner_id: string
          procedimentos_realizados?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          alteracoes_lesoes?: Json
          alteracoes_pele?: Json
          assinatura_paciente_url?: string | null
          assinatura_profissional_url?: string | null
          autorizacao_uso_imagem?: boolean
          cliente_id?: string
          created_at?: string
          dados_clinicos?: Json
          dados_gerais?: Json
          dados_pessoais?: Json
          data?: string
          data_retorno?: string | null
          deleted_at?: string | null
          deleted_via_cliente?: boolean
          formato_unhas?: Json
          id?: string
          observacoes_clinicas?: string | null
          orientacao?: string | null
          owner_id?: string
          procedimentos_realizados?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          contato_emergencia_nome: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          deleted_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          genero: string | null
          id: string
          nome: string
          numero: string | null
          observacoes: string | null
          owner_id: string
          rua: string | null
          telefone: string | null
          telefone_emergencia: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          contato_emergencia_nome?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          deleted_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          genero?: string | null
          id?: string
          nome: string
          numero?: string | null
          observacoes?: string | null
          owner_id: string
          rua?: string | null
          telefone?: string | null
          telefone_emergencia?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          contato_emergencia_nome?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          deleted_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          genero?: string | null
          id?: string
          nome?: string
          numero?: string | null
          observacoes?: string | null
          owner_id?: string
          rua?: string | null
          telefone?: string | null
          telefone_emergencia?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      consultas: {
        Row: {
          cliente_id: string
          created_at: string
          data: string
          horario: string
          id: string
          observacoes: string | null
          owner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data: string
          horario: string
          id?: string
          observacoes?: string | null
          owner_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data?: string
          horario?: string
          id?: string
          observacoes?: string | null
          owner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      estoque_produtos: {
        Row: {
          categoria: string | null
          created_at: string
          id: string
          nome: string
          owner_id: string
          preco: number | null
          quantidade: number
          quantidade_minima: number
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          id?: string
          nome: string
          owner_id: string
          preco?: number | null
          quantidade?: number
          quantidade_minima?: number
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          id?: string
          nome?: string
          owner_id?: string
          preco?: number | null
          quantidade?: number
          quantidade_minima?: number
          updated_at?: string
        }
        Relationships: []
      }
      financeiro_registros: {
        Row: {
          categoria: string
          created_at: string
          data: string
          descricao: string | null
          id: string
          owner_id: string
          status_pagamento: string
          tipo: string
          valor: number
        }
        Insert: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          owner_id: string
          status_pagamento?: string
          tipo: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          owner_id?: string
          status_pagamento?: string
          tipo?: string
          valor?: number
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome_contato: string | null
          nome_empresa: string
          observacoes: string | null
          owner_id: string
          telefone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome_contato?: string | null
          nome_empresa: string
          observacoes?: string | null
          owner_id: string
          telefone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome_contato?: string | null
          nome_empresa?: string
          observacoes?: string | null
          owner_id?: string
          telefone?: string | null
        }
        Relationships: []
      }
      lia_conversas: {
        Row: {
          cliente_id: string | null
          created_at: string
          id: string
          owner_id: string
          titulo: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          owner_id: string
          titulo?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lia_conversas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      lia_mensagens: {
        Row: {
          conteudo: string | null
          conversa_id: string
          created_at: string
          id: string
          imagem_url: string | null
          owner_id: string
          role: string
        }
        Insert: {
          conteudo?: string | null
          conversa_id: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          owner_id: string
          role: string
        }
        Update: {
          conteudo?: string | null
          conversa_id?: string
          created_at?: string
          id?: string
          imagem_url?: string | null
          owner_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "lia_mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "lia_conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          asaas_customer_id: string | null
          asaas_subscription_id: string | null
          assinatura_expira_em: string | null
          assinatura_status: string
          avatar_url: string | null
          cpf_cnpj: string | null
          created_at: string
          id: string
          is_admin: boolean
          nome_clinica: string | null
          nome_completo: string | null
          plano: string
          telefone: string | null
          trial_expira_em: string | null
          updated_at: string
        }
        Insert: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          assinatura_expira_em?: string | null
          assinatura_status?: string
          avatar_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          id: string
          is_admin?: boolean
          nome_clinica?: string | null
          nome_completo?: string | null
          plano?: string
          telefone?: string | null
          trial_expira_em?: string | null
          updated_at?: string
        }
        Update: {
          asaas_customer_id?: string | null
          asaas_subscription_id?: string | null
          assinatura_expira_em?: string | null
          assinatura_status?: string
          avatar_url?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          nome_clinica?: string | null
          nome_completo?: string | null
          plano?: string
          telefone?: string | null
          trial_expira_em?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_accounts: {
        Args: never
        Returns: {
          id: string
          email: string
          nome_completo: string | null
          nome_clinica: string | null
          telefone: string | null
          plano: string
          assinatura_status: string
          assinatura_expira_em: string | null
          trial_expira_em: string | null
          is_admin: boolean
          created_at: string
          clientes_count: number
        }[]
      }
      expirar_assinaturas_vencidas: { Args: never; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      purge_deleted_clientes: {
        Args: { p_dias_retencao?: number }
        Returns: undefined
      }
      restore_cliente: { Args: { p_cliente_id: string }; Returns: undefined }
      soft_delete_cliente: {
        Args: { p_cliente_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Atalhos convenientes usados nas páginas
export type Cliente = Database['public']['Tables']['clientes']['Row']
export type Anamnese = Database['public']['Tables']['anamneses']['Row']
export type Consulta = Database['public']['Tables']['consultas']['Row']
export type FinanceiroRegistro = Database['public']['Tables']['financeiro_registros']['Row']
export type EstoqueProduto = Database['public']['Tables']['estoque_produtos']['Row']
export type Fornecedor = Database['public']['Tables']['fornecedores']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type LiaConversa = Database['public']['Tables']['lia_conversas']['Row']
export type AdminAccount = Database['public']['Functions']['admin_list_accounts']['Returns'][number]
export type AdminFinanceiroCache = Database['public']['Tables']['admin_financeiro_cache']['Row']
