import React from 'react'
import { useTranslation } from 'react-i18next'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { LANGUAGES } from '../../i18n'
import moment from 'src/utils/moment'

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
        <span style={{ fontSize: 18 }}>{current.flag}</span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{current.code.toUpperCase()}</span>
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
            <span style={{ fontSize: 16 }}>{lang.flag}</span>
            <span>{lang.label}</span>
          </CDropdownItem>
        ))}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default LanguageSwitcher
