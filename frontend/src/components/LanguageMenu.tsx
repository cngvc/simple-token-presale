import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'

const languages = [
  { key: 'gb', name: 'English' },
  { key: 'de', name: 'Germany' },
  { key: 'fr', name: 'French' },
  { key: 'pt', name: 'Portuguese' },
  { key: 'tr', name: 'Turkish' },
  { key: 'ru', name: 'Russian' },
  { key: 'it', name: 'Italian' },
  { key: 'id', name: 'Indonesian' },
  { key: 'ar', name: 'Arablic' },
  { key: 'cn', name: 'Chinese' },
  { key: 'vn', name: 'Vietnam' },
  { key: 'th', name: 'Thai' }
]

const LANGUAGE_SELECTOR_ID = 'language-selector'

export const LanguageMenu = () => {
  const [isShowingModel, $isShowingModel] = useState(false)
  const { i18n } = useTranslation()

  const selectedLanguage = languages.find((language) => language.key === i18n.language)

  const handleLanguageChange = async (language: { key: string; name: string }) => {
    localStorage.setItem('language', language.key)
    await i18n.changeLanguage(language.key)
    $isShowingModel(false)
  }

  useEffect(() => {
    const handleWindowClick = (event: any) => {
      const target = event.target.closest('button')
      if (target && target.id === LANGUAGE_SELECTOR_ID) {
        return
      }
      $isShowingModel(false)
    }
    window.addEventListener('click', handleWindowClick)
    return () => {
      window.removeEventListener('click', handleWindowClick)
    }
  }, [])

  return (
    <>
      <button
        onClick={() => {
          $isShowingModel((prev) => !prev)
        }}
        id={LANGUAGE_SELECTOR_ID}
        className='flex items-center text-white justify-center w-16'
      >
        <span className={`fi fi-${selectedLanguage?.key} mr-0.5 rounded`} />
        <img
          alt='Down'
          src='images/icons/dropdown.svg'
          className={twMerge('h-6 w-6 object-contain', isShowingModel && 'rotate-180')}
        />
      </button>

      {isShowingModel && (
        <div
          className='card card-active origin-top-right absolute right-4 top-20 p-3 shadow-md z-50'
          role='menu'
          aria-orientation='vertical'
          aria-labelledby={LANGUAGE_SELECTOR_ID}
        >
          <div className='py-0.5 grid grid-cols-2 gap-2.5' role='none'>
            {languages.map((language) => {
              return (
                <button
                  key={language.key}
                  onClick={() => handleLanguageChange(language)}
                  className={twMerge(
                    'p-1 t_base text-start items-center inline-flex text-light-primary rounded hover:text-primary',
                    selectedLanguage?.key === language.key && 'bg-primary text-black'
                  )}
                  role='menuitem'
                >
                  <span className={`fi fi-${language.key} mr-0.5 rounded`}></span>
                  <span className='truncate ml-2'>{language.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
