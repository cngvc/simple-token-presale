import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { internal, telegram, twitter } from '@/urls'

import Section from './Section'

const socials = [
  {
    name: 'twitter',
    url: twitter,
    icon: 'images/icons/twitter.svg'
  },
  {
    name: 'telegram',
    url: telegram,
    icon: 'images/icons/telegram.svg'
  }
]

const emails = [
  {
    label: 'Technical Support:',
    email: 'support@memenetwork.com'
  },
  {
    label: 'Marketing:',
    email: 'marketing@memenetwork.com'
  }
]

const Footer = () => {
  const { t } = useTranslation()

  return (
    <Section className='h-full mt-32'>
      <div className='h-full w-full relative overflow-hidden'>
        <div className='w-full flex flex-col items-center justify-center'>
          <div className='flex flex-wrap justify-center mx-auto gap-2.5 w-full mb-5 md:mb-10'>
            {emails.map((e, index) => (
              <div
                key={index}
                className='flex items-center card px-6 py-3 font-space-grotesk t_base gap-5'
                rel='noreferrer'
              >
                <img src='images/icons/email.svg' alt='Social' className='flex-shrink-0' />
                <div>
                  <span className='text-primary'>{e.label}</span>{' '}
                  <Link to={`mailto:${e.email}`} className='font-bold'>
                    {e.email}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className='flex flex-wrap justify-center mx-auto gap-5 md:gap-10 mb-5 md:mb-10'>
            {socials.map((e, index) => (
              <Link
                key={index}
                target='_blank'
                to={e.url}
                className='flex justify-center items-center w-10 h-10 rounded-full hover:bg-light-primary/30 duration-200'
                rel='noreferrer'
              >
                <img src={e.icon} alt='Social' className='flex-shrink-0' />
              </Link>
            ))}
          </div>

          <div className='flex flex-row gap-10 md:gap-20 mb-2'>
            <Link
              to={internal.terms_of_use}
              className='p-4 t_base font-space-grotesk font-bold text-[#8589A6] duration-200 hover:text-light-primary'
            >
              {t('terms_of_use')}
            </Link>
            <Link
              to={internal.privacy_policy}
              className='p-4 t_base font-space-grotesk font-bold text-[#8589A6] duration-200 hover:text-light-primary'
            >
              {t('privacy_policy')}
            </Link>
          </div>
        </div>

        <div className='card md:w-4/5 mx-auto p-5'>
          <p className='t_base text-left text-white/60 font-space-grotesk font-normal'>
            <span className='text-primary font-bold'>{t('disclaimer')}:</span> Lorem Ipsum is simply dummy text of the
            printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the
            1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book
          </p>
        </div>
      </div>
    </Section>
  )
}

export default Footer
