import React, { useEffect, useRef } from 'react'
import { trackPageVisit } from 'src/services/firebase/cashflow/pageVisits'
import './AboutMe.scss'

import NodeImg from 'src/assets/images/skills/nodejs.png'
import DockerImg from 'src/assets/images/skills/docker.png'
import Html5Img from 'src/assets/images/skills/html5.png'
import LinuxImg from 'src/assets/images/skills/linux.png'
import AwsImg from 'src/assets/images/skills/aws.png'
import GolangImg from 'src/assets/images/skills/golang.png'
import ReacJsImg from 'src/assets/images/skills/reactjs.png'
import MongoDbImg from 'src/assets/images/skills/mongodb.png'
import MysqlImg from 'src/assets/images/skills/mysql.png'
import ReduxImg from 'src/assets/images/skills/redux.png'
import SagaImg from 'src/assets/images/skills/sagas.png'
import RedisImg from 'src/assets/images/skills/redis.png'

const SKILLS = {
  Backend: [
    { name: 'Node.js', img: NodeImg },
    { name: 'Go', img: GolangImg },
    { name: 'MongoDB', img: MongoDbImg },
    { name: 'MySQL', img: MysqlImg },
    { name: 'Redis', img: RedisImg },
  ],
  Frontend: [
    { name: 'React', img: ReacJsImg },
    { name: 'Redux', img: ReduxImg },
    { name: 'Sagas', img: SagaImg },
    { name: 'HTML5', img: Html5Img },
  ],
  'DevOps & Cloud': [
    { name: 'AWS', img: AwsImg },
    { name: 'Docker', img: DockerImg },
    { name: 'Linux', img: LinuxImg },
  ],
}

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

const MatrixRain = () => {
  const canvasRef = React.useRef()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()アイウエオカキクケコサシスセソタチツテトナニヌネノ'
    const fontSize = 13
    let cols, drops, raf

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      cols = Math.floor(canvas.width / fontSize)
      drops = Array(cols).fill(1)
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px monospace`

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        // head char brighter, trail fades
        ctx.fillStyle = `rgba(0, 255, 65, ${Math.random() > 0.95 ? 0.9 : 0.35})`
        ctx.fillText(char, x, y * fontSize)
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="about__matrix" />
}

const useCursorGlow = (containerRef) => {
  const dotRef = useRef()
  const ringRef = useRef()
  const glowRef = useRef()

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    const glow = glowRef.current
    if (!dot || !ring || !glow) return

    let mx = window.innerWidth / 2,
      my = window.innerHeight / 2
    let rx = mx,
      ry = my
    let raf

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      dot.style.transform = `translate(${mx}px, ${my}px)`
      // spotlight follows instantly
      glow.style.background = `radial-gradient(400px circle at ${mx}px ${my}px, rgba(99,102,241,0.12) 0%, transparent 70%)`
    }

    const animate = () => {
      rx += (mx - rx) * 0.1
      ry += (my - ry) * 0.1
      ring.style.transform = `translate(${rx}px, ${ry}px)`
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return { dotRef, ringRef, glowRef }
}

const AboutMe = () => {
  const containerRef = useRef()
  const { dotRef, ringRef, glowRef } = useCursorGlow(containerRef)

  useEffect(() => {
    trackPageVisit('about-me')
  }, [])

  return (
    <div className="about" ref={containerRef}>
      {/* ── Cursor ── */}
      <div ref={dotRef} className="about__cursor-dot" />
      <div ref={ringRef} className="about__cursor-ring" />
      <div ref={glowRef} className="about__cursor-glow" />

      {/* ── Hero ── */}
      <section className="about__hero">
        <div className="about__bg" />
        <MatrixRain />
        <div className="about__grid" />
        <div className="about__orb about__orb--1" />
        <div className="about__orb about__orb--2" />
        <div className="about__orb about__orb--3" />

        <div className="about__hero-content">
          <div className="about__tag">Available for work</div>

          <a href="/login" style={{ textDecoration: 'none' }}>
            <h1 className="about__name">David Rios</h1>
          </a>

          <p className="about__title">
            Full-Stack <strong>Software Engineer</strong>
          </p>

          <p className="about__quote">&ldquo;I love to travel but, I hate to arrive.&rdquo;</p>

          <div className="about__cta">
            <a
              className="about__btn about__btn--primary"
              href="https://www.linkedin.com/in/yefriddavid"
              target="_blank"
              rel="noreferrer"
            >
              <LinkedInIcon /> LinkedIn
            </a>
            <a
              className="about__btn about__btn--outline"
              href="https://github.com/yefriddavid"
              target="_blank"
              rel="noreferrer"
            >
              <GithubIcon /> GitHub
            </a>
          </div>
        </div>

        <div className="about__scroll">
          <div className="about__scroll-dot" />
          scroll
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="about__stats">
        {[
          { number: '8+', label: 'Años de experiencia' },
          { number: '20+', label: 'Proyectos entregados' },
          { number: '12', label: 'Tecnologías' },
          { number: '∞', label: 'Ganas de aprender' },
        ].map((s) => (
          <div className="about__stat" key={s.label}>
            <div className="about__stat-number">{s.number}</div>
            <div className="about__stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Skills ── */}
      <section className="about__section">
        <p className="about__section-tag">Tech Stack</p>
        <h2 className="about__section-title">Tecnologías que domino</h2>
        <p className="about__section-sub">Las herramientas con las que construyo día a día.</p>

        {Object.entries(SKILLS).map(([group, items]) => (
          <div className="about__skills-group" key={group}>
            <div className="about__skills-group-title">{group}</div>
            <div className="about__skills-grid">
              {items.map((skill) => (
                <div className="about__skill-card" key={skill.name}>
                  <img className="about__skill-logo" src={skill.img} alt={skill.name} />
                  <span className="about__skill-name">{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer className="about__footer">
        Hecho con ♥ ·{' '}
        <a href="https://www.linkedin.com/in/yefriddavid" target="_blank" rel="noreferrer">
          @yefriddavid
        </a>
      </footer>
    </div>
  )
}

export default AboutMe
