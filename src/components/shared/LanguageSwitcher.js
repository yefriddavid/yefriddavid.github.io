import React from 'react'
import { useTranslation } from 'react-i18next'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { LANGUAGES } from '../../i18n'
import moment from 'src/utils/moment'
import './LanguageSwitcher.scss'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  const changeLanguage = (code) => {
    moment.locale(code)
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
  }

  return (
    <CDropdown variant="nav-item" placement="bottom-end">
      <CDropdownToggle caret={false} className="d-flex align-items-center gap-1 px-2">
        <span className="language-switcher__flag">{current.flag}</span>
        <span className="language-switcher__code">{current.code.toUpperCase()}</span>
      </CDropdownToggle>
      <CDropdownMenu>
        {LANGUAGES.map((lang) => (
          <CDropdownItem
            key={lang.code}
            active={i18n.language === lang.code}
            as="button"
            type="button"
            className="d-flex align-items-center gap-2"
            onClick={() => changeLanguage(lang.code)}
          >
            <span className="language-switcher__option-flag">{lang.flag}</span>
            <span>{lang.label}</span>
          </CDropdownItem>
        ))}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default LanguageSwitcher
