import { NavLink, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/dashboard', icon: 'fa-house',         label: 'Home'      },
  { to: '/itinerary', icon: 'fa-map',            label: 'Itinerary' },
  { to: '/safety',    icon: 'fa-shield-halved',  label: 'Safety'    },
  { to: '/profile',   icon: 'fa-circle-user',    label: 'Profile'   },
]

const HIDE_ON = ['/', '/login', '/signup', '/questionnaire']

export default function Navbar() {
  const { pathname } = useLocation()
  if (HIDE_ON.includes(pathname)) return null
  return (
    <nav className="nav-bar">
      {LINKS.map(l => (
        <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <i className={`fa-solid ${l.icon}`} />
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
