import React from 'react'
import { Routes, Route } from 'react-router-dom'

import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import UserList from '../pages/UserList'
import CarList from '../pages/CarList'

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={ <HomePage /> } />
    <Route path="/login" element = { <LoginPage /> } />
    <Route path="/users" element = { <UserList /> } />
    <Route path="/cars" element = { <CarList /> } />
  </Routes>
}