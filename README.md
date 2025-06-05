# Legal Data Api (Registros OAB)
```  
curl -X GET "168.231.90.14:3004/api/v1/lawyer/PR_54180" \
  -H "X-Api-Key: d26bba07e4b643198d98c7b3567417b487c2969188e8ea4e" \
  -H "Content-Type: application/json"
```   

# OCR API 
Comprovante de Residência: 
```   
curl -X POST "http://168.231.91.47:8000/process/comprovante-residencia" \
     -H "X-API-Key: Trumbo123$" \
     -F "file=@/home/brpl/psia/CR/BA/8-ruim.pdf"
```   

Contrato Social: 
```   
curl -X POST http://168.231.91.47:8000/process/contrato-social \
     -H "X-API-Key: Trumbo123$" \
     -F "file=@/home/brpl/psia/CS/cs.pdf"
``` 

CNH: 
```   
curl -X POST http://168.231.91.47:8000/process/cnh \
     -H "X-API-Key: Trumbo123$" \
     -F "file=@/home/brpl/psia/CNH-BOA/M1/7.jpg"
``` 


## 👤 You ##

Crie um esquema para uma API desenhada sobre o WhatsApp com IA. 

A ia tera alguns dados requeridos como contratante e contratado, eles podem ser pessoa fisica ou pessoa juridica. use os padroes que voce ja conhece para os dados necessarios. O usuario tambem podera enviar a CNH e o comprovante de residencia para a leitura em OCR (havera uma endpoint que lera o ocr) e devolvera os dados lidos para a IA - entao preciso de um chamamento de funcao nas endpoints /process/comprovante_residencia e process/cnh. Se for uma pessoa juridica adicione os dados necessarios tambem e tambem existe um endpoint para ler contratos sociais /process/cs ... caso o usuario nao tenha todos os dados necessario faca com os dados que ele possui, o mais importante seria o nome e o cpf das pessoas envolvidas, bem como o CNPJ e o cpf do representante legal da empresa se for CNPJ. Finalmente, se o contrato for feito por um advogado peca tambem o numero da oab com o estado. assim teremos um outro endpoint em que a ia buscara a informacao do advogado. Peca um modelo de contrato e os dados necessarios para sua confeccao, junte com os dados obtidos, envie para a ia e envie o contrato para o usuario 

---

## 🧠 Generic · *Claude 3.7 Sonnet* ##

# Esquema de API para Contratos via WhatsApp com IA

Vou criar um esquema detalhado para uma API que integra WhatsApp com IA para geração de contratos, incluindo processamento OCR de documentos e validação de dados.

## Arquitetura Geral

```mermaid
graph TD
    A[Cliente WhatsApp] -->|Documentos e Mensagens| B[API WhatsApp]
    B -->|Processamento| C[Serviço de IA]
    C -->|Extração de Dados| D[Processador OCR]
    D -->|Dados Extraídos| C
    C -->|Geração de Texto| F[Gerador de Contratos]
    F -->|Texto do Contrato| H[Conversor PDF]
    H -->|PDF Final| B
    B -->|Envio do Contrato| A
    C -->|Consulta OAB| G[API Externa OAB]
    G -->|Dados do Advogado| C
```

## DB - Pessoa Fisica
```json
{
  "nome_completo": "string",
  "cpf": "string",
  "rg": "string",
  "data_nascimento": "YYYY-MM-DD",
  "estado_civil": "string",
  "profissao": "string",
  "endereco": {
    "logradouro": "string",
    "numero": "string",
    "complemento": "string",
    "bairro": "string",
    "cidade": "string",
    "estado": "string",
    "cep": "string"
  },
  "contato": {
    "email": "string",
    "telefone": "string"
  }
}
```

## DB - Pessoa Juridica
```json
{
  "razao_social": "string",
  "nome_fantasia": "string",
  "cnpj": "string",
  "inscricao_estadual": "string",
  "endereco": {
    "logradouro": "string",
    "numero": "string",
    "complemento": "string",
    "bairro": "string",
    "cidade": "string",
    "estado": "string",
    "cep": "string"
  },
  "representante_legal": {
    "nome_completo": "string",
    "cpf": "string",
    "rg": "string",
    "cargo": "string"
  },
  "contato": {
    "email": "string",
    "telefone": "string"
  }
}
```

## DB - Advogado 
```json
{
  "nome_completo": "string",
  "numero_oab": "string",
  "estado_oab": "string",
  "email": "string",
  "telefone": "string"
}
```


# Geração do Contrato
A ser feito ainda. No momento ainda não temos endpoint, seria apenas o texto. 

## Fluxo de Interação com WhatsApp

```mermaid
sequenceDiagram
    participant U as Usuário (WhatsApp)
    participant W as API WhatsApp
    participant A as IA Assistant
    participant O as OCR Service
    participant V as Validador
    participant G as Gerador de Contratos
    participant P as Conversor PDF
    
    U->>W: Inicia conversa
    W->>A: Processa mensagem
    A->>U: Solicita tipo de contrato
    U->>W: Informa tipo de contrato
    W->>A: Processa informação
    A->>U: Solicita documentos do contratante
    
    U->>W: Envia imagem CNH
    W->>O: Processa OCR (/process/cnh)
    O->>A: Retorna dados extraídos
    
    U->>W: Envia comprovante de residência
    W->>O: Processa OCR (/process/comprovante_residencia)
    O->>A: Retorna dados extraídos
    
    alt Dados incompletos
        A->>U: Solicita informações complementares específicas
        U->>W: Envia informações complementares
        W->>A: Processa informações
    end
    
    A->>U: Solicita documentos do contratado
    
    alt Contratado é PF
        U->>W: Envia CNH do contratado
        W->>O: Processa OCR (/process/cnh)
        O->>A: Retorna dados extraídos
        
        U->>W: Envia comprovante de residência
        W->>O: Processa OCR (/process/comprovante_residencia)
        O->>A: Retorna dados extraídos
    else Contratado é PJ
        U->>W: Envia contrato social
        W->>O: Processa OCR (/process/cs)
        O->>A: Retorna dados extraídos
    end
    
    alt Contrato com advogado
        A->>U: Solicita número OAB e estado
        U->>W: Informa número OAB e estado
        W->>V: Valida OAB
        V->>A: Retorna validação
    end
    
    A->>U: Solicita detalhes do contrato
    U->>W: Informa detalhes
    W->>A: Processa detalhes
    A->>G: Solicita geração do texto do contrato
    G->>A: Retorna texto do contrato
    A->>P: Solicita conversão para PDF
    P->>A: Retorna PDF do contrato
    A->>U: Envia contrato PDF e solicita confirmação
    U->>W: Confirma contrato
    W->>A: Processa confirmação
    A->>U: Envia contrato final e instruções
```

## Estrutura de Dados Mínima

Para casos onde o usuário não forneça todos os dados, a API deve funcionar com um conjunto mínimo de informações:

### Pessoa Física (mínimo)
- Nome completo
- CPF

### Pessoa Jurídica (mínimo)
- Razão social
- CNPJ
- Nome do representante legal
- CPF do representante legal

### Advogado (mínimo)
- Nome completo
- Número OAB
- Estado OAB

## Considerações de Implementação (Revisadas)

1. **Prioridade ao OCR**: O sistema deve priorizar a extração automática de dados via OCR, solicitando informações manuais apenas quando necessário.

2. **Mensagens de Erro**: As mensagens de erro devem ser claras e específicas, indicando exatamente quais informações estão faltando ou são inválidas.

3. **Geração de PDF**: O serviço de conversão para PDF deve garantir a formatação adequada para documentos legais, incluindo espaços para assinaturas.

4. **Confirmação Simplificada**: O processo de confirmação deve ser simples, exigindo apenas uma resposta afirmativa ou negativa do usuário.

5. **Fallback Automático**: Implementar mecanismos automáticos de fallback para quando o OCR falhar, solicitando apenas os campos específicos que não puderam ser extraídos.

6. **Armazenamento Temporário**: Implementar políticas de armazenamento temporário para documentos sensíveis, com exclusão automática após a geração do contrato.

7. **Validação em Tempo Real**: Validar dados críticos (CPF, CNPJ, OAB) em tempo real para evitar problemas no contrato final.

8. **Logs de Auditoria**: Manter registros detalhados de todas as interações e processamentos para fins de auditoria.

Este esquema revisado coloca o envio de documentos como fluxo principal, simplifica as interações com o usuário e adiciona um serviço de conversão para PDF, atendendo às suas solicitações. An unexpected error occurred: **[Error] Stream closed** Please retry.

