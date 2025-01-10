import Hero from '@/components/home/Hero'
import Features from '@/components/home/Features'
import Pricing from '@/components/home/Pricing'
import RegisterPage from './auth/register/page'
import LoginPage from './auth/login/page'
import HotelDashboard from './(hotel-admin)/dashboard/page'

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Pricing /> 
    </>
  )
}