import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import CategoryCarousel from './CategoryCarousel'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  useGetAllJobs();
  const { user, initialized } = useSelector(store => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (!initialized) return;
    if (user?.role === 'employer') {
      navigate("/employer/companies");
    } else if (user?.role === 'admin') {
      navigate("/admin/dashboard");
    }
  }, [initialized, user, navigate]);
  return (
    <div>
      <Navbar />
      <HeroSection />
      <CategoryCarousel />
      <LatestJobs />
      <Footer />
    </div>
  )
}

export default Home
