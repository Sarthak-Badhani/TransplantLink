import { RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/theme.css'
import router from './routes'

export default function App(){
  return <RouterProvider router={router} />
}
