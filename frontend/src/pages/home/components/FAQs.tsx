import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { twJoin, twMerge } from 'tailwind-merge'

import Section from '@/components/Section'

const FAQs = () => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true
  })
  const { t } = useTranslation()
  const questions = useMemo(
    () => [
      {
        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
      },
      {
        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
      },
      {
        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
      },
      {
        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
      },
      {
        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
      },
      {
        title: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
      }
    ],
    [t]
  )

  return (
    <div ref={ref}>
      <Section className='z-10'>
        <div className='mx-auto w-full md:w-8/12 flex flex-col items-center justify-center gap-2 relative'>
          <div className='flex items-center justify-center w-full mb-14'>
            <h1 className={twJoin('text-center', inView && 'animate-fade-down')}>
              {t('faq_title_1')}
              <br />
              <span className='text-primary'>{t('faq_title_2')}</span>
            </h1>
          </div>

          <div className='flex flex-col gap-5 w-full items-center'>
            {questions.map((e, index) => {
              return <FAQItem key={index} {...e} />
            })}
          </div>
        </div>
      </Section>
    </div>
  )
}

export default FAQs

// extension
const FAQItem = ({ title, description }: { title: string; description: string }) => {
  const [isShowingAnswer, setShowingAnswer] = useState(false)
  return (
    <div
      onClick={() => setShowingAnswer((prev) => !prev)}
      className={twMerge(
        'w-full py-3 px-8 cursor-pointer duration-200 ease-in-out bg-gradient-to-b border-[0.5px] border-white/30',
        isShowingAnswer && 'py-8 from-darkest-primary/70 to-black border-light-primary/30 rounded-md'
      )}
    >
      <div className='grid grid-cols-[1fr_auto] items-center'>
        <p className='text-white t_base font-light'>{title}</p>
        <span className='text-[1.5rem] text-primary font-orbitron'>{isShowingAnswer ? '-' : '+'}</span>
      </div>

      {isShowingAnswer && (
        <p className='text-white t_lg pr-20 mt-4' dangerouslySetInnerHTML={{ __html: description }}></p>
      )}
    </div>
  )
}
