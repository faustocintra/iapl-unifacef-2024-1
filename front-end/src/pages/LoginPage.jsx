import React from 'react'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import myfetch from '../lib/myfetch'
import { useNavigate } from 'react-router-dom'

/*
Armazenamento no Cliente: Os tokens JWT são armazenados no cliente (por exemplo, em cookies ou localStorage) e enviados ao servidor com cada requisição. O servidor não precisa armazenar o estado da sessão.
Validação de Token: A validade do token é verificada pelo servidor decodificando o token e verificando sua assinatura. O token contém as informações do usuário e as permissões necessárias para a autenticação.
Segurança: Os tokens JWT são mais vulneráveis ao roubo de tokens, pois contêm informações codificadas sobre o usuário. No entanto, a segurança pode ser aumentada usando HTTPS e outras práticas de segurança.

Armazenamento no Servidor: As sessões são armazenadas no servidor e identificadas por um identificador de sessão único (sessid). O servidor armazena o estado da sessão e os dados associados a cada usuário autenticado.
Validação de Sessão: A validade da sessão é verificada no servidor. O servidor pode invalidar a sessão a qualquer momento, por exemplo, ao fazer logout.
*/

export default function LoginPage() {
  // Define o estado inicial para armazenar o nome de usuário e a senha
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')

  // Hook de navegação para redirecionar o usuário após o login
  const navigate = useNavigate()

  // Função para lidar com o envio do formulário de login
  async function handleFormSubmit(event) {
    event.preventDefault()    // Evita o recarregamento da página
    
    try {
      // Dispara uma requisição POST para o back-end para autenticação do usuário
      // Os dados do formulário (nome de usuário e senha) são enviados no corpo da requisição
      await myfetch.post('/users/login', { username, password })

      // Se o login for bem-sucedido, o token estará no resultado da requisição
      // Esse token pode ser usado para autorizar futuras requisições do usuário
      // Aqui estamos armazenando o token no localStorage (método inseguro para produção)
      // window.localStorage.setItem(import.meta.env.VITE_AUTH_TOKEN_NAME, result.token)

      // Redireciona o usuário para a página inicial após o login bem-sucedido
      navigate('/')
    }
    catch(error) {
      // Em caso de erro (por exemplo, credenciais inválidas), uma mensagem de erro é exibida
      alert(error.message)
    }
  }

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Autentique-se
      </Typography>
      <form onSubmit={handleFormSubmit}>
        
        <TextField 
          label="Usuário" 
          variant="filled" 
          value={username}
          fullWidth
          sx={{ mb: 2 }}
          onChange={event => setUsername(event.target.value)}
        />

        <TextField 
          label="Senha" 
          variant="filled"
          type="password" 
          value={password}
          fullWidth
          sx={{ mb: 2 }}
          onChange={event => setPassword(event.target.value)}
        />

        <Button 
          variant="contained"
          type="submit"
          fullWidth
        >
          Enviar
        </Button>

      </form>
    </>
  )
}
