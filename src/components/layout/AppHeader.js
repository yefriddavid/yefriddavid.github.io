import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilContrast, cilFullscreen, cilFullscreenExit, cilMenu, cilMoon, cilPaint, cilSun } from '@coreui/icons'

import { AppBreadcrumb } from '../index'
import AppHeaderDropdown from './AppHeaderDropdown'
import LanguageSwitcher from '../shared/LanguageSwitcher'
import useVersionCheck from '../../hooks/useVersionCheck'
import './AppHeader.scss'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.ui.sidebarShow)
  const appTheme = useSelector((state) => state.ui.appTheme)
  const hasUpdate = useVersionCheck()

  useEffect(() => {
    let lastScrollY = window.scrollY
    const onScroll = () => {
      const currentScrollY = document.documentElement.scrollTop
      headerRef.current?.classList.toggle('shadow-sm', currentScrollY > 0)
      if (window.innerWidth <= 991) {
        if (currentScrollY > lastScrollY && currentScrollY > 60) {
          headerRef.current?.classList.add('header--hidden')
        } else {
          headerRef.current?.classList.remove('header--hidden')
        }
      }
      lastScrollY = currentScrollY
    }
    document.addEventListener('scroll', onScroll)
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const isTest = import.meta.env.MODE === 'development'

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      {isTest && (
        <div
          style={{
            background: '#7c3aed',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '4px 16px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          ⚠ ENTORNO DE PRUEBAS — los datos no son reales
        </div>
      )}
      {hasUpdate && (
        <div
          style={{
            background: '#ffc107',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '6px 16px',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <span>Nueva versión disponible</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#000',
              color: '#ffc107',
              border: 'none',
              borderRadius: 4,
              padding: '2px 10px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Actualizar
          </button>
        </div>
      )}
      <CContainer className="border-bottom px-4 py-0" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderNav className="d-none d-md-flex">
          <CNavItem>
            <CNavLink to="/dashboard" as={NavLink}>
              Dashboard
            </CNavLink>
          </CNavItem>
          {/*}<CNavItem>
            <CNavLink href="#">Users</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">Settings</CNavLink>
          </CNavItem>
    */}
        </CHeaderNav>
        <CHeaderNav className="ms-auto">
          <div className="d-none d-md-flex align-items-center">
            <li className="nav-item py-0">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>
            <CDropdown variant="nav-item" placement="bottom-end">
              <CDropdownToggle caret={false}>
                {colorMode === 'dark' ? (
                  <CIcon icon={cilMoon} size="lg" />
                ) : colorMode === 'auto' ? (
                  <CIcon icon={cilContrast} size="lg" />
                ) : (
                  <CIcon icon={cilSun} size="lg" />
                )}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem
                  active={colorMode === 'light'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('light')}
                >
                  <CIcon className="me-2" icon={cilSun} size="lg" /> Light
                </CDropdownItem>
                <CDropdownItem
                  active={colorMode === 'dark'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('dark')}
                >
                  <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
                </CDropdownItem>
                <CDropdownItem
                  active={colorMode === 'auto'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('auto')}
                >
                  <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
            <li className="nav-item py-0">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>
            <CDropdown variant="nav-item" placement="bottom-end">
              <CDropdownToggle caret={false} title="Tema">
                <CIcon icon={cilPaint} size="lg" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem
                  active={appTheme === 'yellow'}
                  className="d-flex align-items-center gap-2"
                  as="button"
                  type="button"
                  onClick={() => dispatch({ type: 'set', appTheme: 'yellow' })}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      backgroundColor: '#ffc107',
                      border: '1px solid #0002',
                    }}
                  />
                  Cash (Amarillo)
                </CDropdownItem>
                <CDropdownItem
                  active={appTheme === 'blue'}
                  className="d-flex align-items-center gap-2"
                  as="button"
                  type="button"
                  onClick={() => dispatch({ type: 'set', appTheme: 'blue' })}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      backgroundColor: '#1e3a5f',
                      border: '1px solid #0002',
                    }}
                  />
                  Ocean (Azul)
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
            <li className="nav-item py-0">
              <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
            </li>
            <CNavItem>
              <CNavLink as="button" onClick={toggleFullscreen} title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
                <CIcon icon={isFullscreen ? cilFullscreenExit : cilFullscreen} size="lg" />
              </CNavLink>
            </CNavItem>
          </div>
          <li className="nav-item py-0">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <LanguageSwitcher />
          <li className="nav-item py-0">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4 py-0" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
