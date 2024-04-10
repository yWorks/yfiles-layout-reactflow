import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import routes from './routes.ts'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentPath, setCurrentPath] = useState(location.pathname)

  useEffect(() => {
    const name = routes.find(route => route.path === currentPath)?.title
    document.title = `Example${name ? ' - ' + name : ''} [yFiles Layout Algorithms for React Flow - Examples]`
    navigate(currentPath)
  }, [currentPath, navigate])

  return (
    <>
      <header>
        <select
          title="examples"
          value={currentPath}
          onChange={event => setCurrentPath(event.target.value)}
        >
          {routes.map(route => (
            <option value={route.path} key={route.path}>
              {route.title}
            </option>
          ))}
        </select>
        {routes
          .filter(route => route.path === currentPath)
          .map(route => (
            <div className="description" key={route.path}>
              {route.description}
            </div>
          ))}
      </header>
      <Outlet />
    </>
  )
}
