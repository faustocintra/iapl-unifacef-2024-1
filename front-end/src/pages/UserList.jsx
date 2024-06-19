import React from 'react'
import myfetch from '../lib/myfetch'
import { DataGrid } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Typography from '@mui/material/Typography'

export default function UserList() {
  // Define o estado inicial como uma lista vazia de usuários
  const [users, setUsers] = React.useState([])

  // Usa o hook useEffect para carregar os dados quando o componente for montado
  React.useEffect(() => {
    fetchData()
  }, [])

  // Função assíncrona para buscar dados de usuários do back-end
  async function fetchData() {
    try {
      // Faz uma requisição GET para buscar a lista de usuários
      const result = await myfetch.get('/users')
      // Atualiza o estado 'users' com os dados recebidos
      setUsers(result)
    } catch (error) {
      // Em caso de erro, exibe uma mensagem de erro no console e alerta o usuário
      console.error(error)
      alert(error.message)
    }
  }

  // Definição das colunas para o DataGrid
  const columns = [
    {
      field: 'fullname',
      headerName: 'Nome completo',
      width: 250
    },
    {
      field: 'username',
      headerName: 'Nome de usuário',
      width: 150
    },
    {
      field: 'is_admin',
      headerName: 'É admin?',
      headerAlign: 'center',
      align: 'center',
      // Renderiza um ícone de checkbox se o usuário for admin
      renderCell: params => (
        params.row.is_admin ? <CheckBoxIcon /> : ''
      )
    }
  ]

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Relação de usuários
      </Typography>

      <Paper elevation={6} sx={{ height: 400 }}>
        <DataGrid
          rows={users}          // Define as linhas da tabela com os dados dos usuários
          columns={columns}     // Define as colunas da tabela
          pageSizeOptions={[5]} // Define as opções de tamanho de página
        />
      </Paper>
    </>
  )
}
