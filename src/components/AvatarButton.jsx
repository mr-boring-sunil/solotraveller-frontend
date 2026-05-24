import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AvatarButton() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Get initials from user name
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div
      className="avatar-btn"
      onClick={() => navigate('/profile')}
      title="View Profile"
    >
      {initials}
    </div>
  )
}
