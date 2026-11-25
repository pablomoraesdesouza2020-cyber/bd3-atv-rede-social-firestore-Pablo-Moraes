# Rede social com Firestore

## Pré-requisitos

- Node.js 22 ou superior.
- Um projeto Firebase com o Cloud Firestore criado.

## Configuração do Firebase

1. No Firebase Console, abra **Databases & Storage > Firestore** e crie o banco, se ainda não existir.
2. No Google Cloud Console, confirme que a **Cloud Firestore API** está ativada para o projeto.
3. No Firebase Console, acesse **Configurações do projeto > Contas de serviço** e gere uma chave privada.
4. Salve o arquivo baixado na raiz deste projeto com o nome `serviceAccountKey.json`.
5. Copie `.env.example` para `.env` e substitua `FIREBASE_PROJECT_ID` pelo ID do seu projeto Firebase.

> A chave de serviço e o `.env` contêm credenciais e não devem ser enviados ao GitHub. O `.gitignore` deste projeto os exclui. Se uma chave já foi compartilhada, revogue-a e gere outra.

## Instalação e execução

No PowerShell do Windows, execute na pasta do projeto:

```powershell
npm.cmd install
npm.cmd start
```

Para desenvolvimento com reinicialização automática:

```powershell
npm.cmd run dev
```

Em outros terminais, os comandos equivalentes são `npm install`, `npm start` e `npm run dev`. Acesse <http://localhost:3000>.

Os posts são salvos na coleção `posts` do Firestore. Cada documento contém `title`, `text` e `createdAt`.

## Publicação no GitHub

Antes de enviar o projeto, confira que `.env`, `serviceAccountKey.json`, outros arquivos de conta de serviço e `node_modules` não estão preparados para commit:

```powershell
git check-ignore -v .env serviceAccountKey.json node_modules
git status --short
```

Não publique o servidor acessível pela internet sem adicionar autenticação e controles contra abuso.
