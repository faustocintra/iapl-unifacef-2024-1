import React from 'react'
import { Routes, Route } from 'react-router-dom'
import UserList from '../pages/UserList'

import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'

export default function AppRoutes() {
  return <Routes>
    <Route path="/" element={ <HomePage /> } />
    <Route path="/login" element = { <LoginPage /> } />
    <Route path="/users" element = { <UserList /> } />
  </Routes>
}