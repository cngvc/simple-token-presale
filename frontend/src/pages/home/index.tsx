import Layout from '@/components/Layouts/Layout'
import Banner from '@/pages/home/components/Banner'
import FAQs from '@/pages/home/components/FAQs'
import CryptoAdoption from '@/pages/home/components/CryptoAdoption'

const Home = () => {
  return (
    <Layout>
      <div className='limited-content justify-center'>
        <div className='absolute w-full h-auto max-h-full pointer-events-none z-0 top-0'>
          <img src='images/banner.jpg' alt='Mask' className='mask-image w-full mx-auto' loading='lazy' />
          <div className='block absolute h-full w-1/12 inset-y-0 left-0 bg-gradient-to-r from-black to-transparent'></div>
          <div className='block absolute h-full w-1/12 inset-y-0 right-0 bg-gradient-to-l from-black to-transparent'></div>
          <div className='block absolute h-1/6 inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent'></div>
          <div className='block absolute h-1/6 inset-x-0 top-0 bg-gradient-to-b from-black to-transparent'></div>
        </div>
        <Banner />
      </div>

      <CryptoAdoption />
      <FAQs />
    </Layout>
  )
}

export default Home
