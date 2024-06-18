import React from 'react'
import myfetch from '../lib/myfetch'
import { DataGrid } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import Typography from '@mui/material/Typography'

export default function CarList() {
  const [cars, setCars] = React.useState([])

  React.useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const result = await myfetch.get('/cars')
      setCars(result)
    }
    catch(error) {
      console.error(error)
      alert(error.message)
    }
  }

  const columns = [
    {
      field: 'brand',
      headerName: 'Nome',
      width: 250
    },
    {
      field: 'model',
      headerName: 'Modelo',
      width: 150
    },
    {
      field: 'imported',
      headerName: 'É importado?',
      headerAlign: 'center',
      align: 'center',
      renderCell: params => (
        params.row.imported ? <CheckBoxIcon /> : ''
      )
    }
  ]

  return (
    <>
      <Typography variant="h2" gutterBottom>
        Relação de Carros
      </Typography>

      <Paper elevation={6} sx={{ height: 400 }}>
        <DataGrid
          rows={cars}
          columns={columns}
          pageSizeOptions={[5]}
        />
      </Paper>
    </>
  )

}