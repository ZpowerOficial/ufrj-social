# UFRJ Social - Guia de Instalação e Desenvolvimento

Este guia fornece instruções detalhadas para configurar e executar o UFRJ Social localmente para desenvolvimento ou teste.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** (normalmente vem com o Node.js)
- **Git**

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/ufrj-social.git
cd ufrj-social
```

### 2. Instale as dependências

```bash
npm install
```

Isso instalará todas as dependências necessárias definidas no arquivo `package.json`.

## Executando o Projeto

### Ambiente de desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Isso iniciará o servidor de desenvolvimento Vite, que suporta Hot Module Replacement (HMR) para atualizações rápidas enquanto você edita o código.

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000).

### Construindo para produção

Para criar uma build de produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

### Pré-visualização da build de produção

Para visualizar a build de produção localmente:

```bash
npm run preview
```

Isso iniciará um servidor local para testar a build de produção.

## Estrutura do Projeto

```
ufrj-social/
├── .github/              # Configurações do GitHub e workflows
├── public/               # Arquivos estáticos e recursos
├── src/                  # Código-fonte do projeto
│   ├── assets/           # Recursos como imagens e fontes
│   ├── components/       # Componentes React reutilizáveis
│   │   ├── auth/         # Componentes relacionados à autenticação
│   │   ├── communities/  # Componentes para comunidades
│   │   ├── feed/         # Componentes do feed de posts
│   │   ├── layout/       # Componentes de layout (header, sidebar, etc.)
│   │   └── ui/           # Componentes UI genéricos
│   ├── contexts/         # Contextos React para estado global
│   ├── hooks/            # Hooks personalizados
│   ├── lib/              # Bibliotecas e utilitários
│   │   ├── nostr.js      # Integração com o protocolo Nostr
│   │   ├── ipfs.js       # Integração com IPFS
│   │   ├── gamification.js # Sistema de gamificação
│   │   ├── communities.js # Gerenciamento de comunidades
│   │   ├── cache.js      # Gerenciamento de cache local
│   │   └── security.js   # Funções de segurança
│   ├── pages/            # Componentes de página
│   ├── router/           # Configuração de rotas
│   ├── App.jsx           # Componente principal da aplicação
│   ├── main.jsx          # Ponto de entrada da aplicação
│   └── index.css         # Estilos globais
├── .eslintrc.cjs         # Configuração do ESLint
├── .gitignore            # Arquivos ignorados pelo Git
├── index.html            # Modelo HTML
├── package.json          # Dependências e scripts
├── postcss.config.js     # Configuração do PostCSS
├── tailwind.config.js    # Configuração do Tailwind CSS
└── vite.config.js        # Configuração do Vite
```

## Fluxo de Desenvolvimento

### 1. Configurando variáveis de ambiente (opcional)

Crie um arquivo `.env.local` na raiz do projeto se precisar de variáveis de ambiente personalizadas:

```
# Exemplo de variáveis de ambiente
VITE_INFURA_PROJECT_ID=seu_id_aqui
VITE_INFURA_API_SECRET=sua_chave_secreta_aqui
VITE_WEB3_STORAGE_TOKEN=seu_token_aqui
```

### 2. Configuração de relays Nostr

O arquivo `src/lib/nostr.js` contém a lista de relays Nostr padrão. Você pode modificá-los para testar com diferentes relays.

### 3. Modificando estilos

Este projeto usa Tailwind CSS para estilos. O arquivo de configuração principal é `tailwind.config.js`.

### 4. Adicionando novas páginas

1. Crie um novo componente de página em `src/pages/`
2. Adicione a rota no arquivo `src/router/index.jsx`

### 5. Adicionando novos componentes

1. Crie um novo componente em `src/components/`
2. Importe e use-o onde necessário

## Deploy para GitHub Pages

### Deploy manual

Para fazer deploy manual para GitHub Pages:

```bash
npm run deploy
```

Isso construirá o projeto e enviará os arquivos para a branch `gh-pages`.

### Deploy automático

O projeto está configurado com GitHub Actions para deploy automático quando você envia alterações para a branch `main`. Veja o arquivo `.github/workflows/deploy.yml` para detalhes.

## Testes

### Executando testes unitários

```bash
npm test
```

Para executar testes em modo de observação:

```bash
npm run test:watch
```

Para ver a cobertura de testes:

```bash
npm run test:coverage
```

## Resolução de Problemas

### Problemas de cache

Se encontrar problemas inexplicáveis, tente limpar o cache:

```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules
npm install
```

### Problemas com CORS (local)

Para testar com relays Nostr localmente, você pode precisar lidar com problemas de CORS. Considere usar extensões de navegador que desabilitem CORS para testes locais ou configurar um proxy.

### Erros de build

Se encontrar erros de build relativos a dependências:

1. Verifique se todas as dependências estão instaladas: `npm install`
2. Tente limpar a cache do Vite: remova a pasta `.vite` e `node_modules/.vite`
3. Verifique se há atualizações necessárias: `npm update`

## Contribuindo

1. Crie uma branch para sua feature: `git checkout -b minha-nova-feature`
2. Faça suas alterações e teste-as bem
3. Confirme suas alterações: `git commit -m 'Adiciona minha nova feature'`
4. Envie para a branch: `git push origin minha-nova-feature`
5. Envie um Pull Request

## Recursos Adicionais

- [Documentação do React](https://reactjs.org/docs/getting-started.html)
- [Documentação do Vite](https://vitejs.dev/guide/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do Nostr](https://github.com/nostr-protocol/nostr)
- [Documentação do IPFS](https://docs.ipfs.io/)

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.