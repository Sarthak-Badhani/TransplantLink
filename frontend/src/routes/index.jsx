import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AppLayout from '../layouts/AppLayout/AppLayout';
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard';
import AddUser from '../pages/Users/AddUser';
import ViewUsers from '../pages/Users/ViewUsers';
import EditUser from '../pages/Users/EditUser';
import DeleteUser from '../pages/Users/DeleteUser';
import RegisterDonor from '../pages/Donors/RegisterDonor';
import DonorList from '../pages/Donors/DonorList';
import RegisterPatient from '../pages/Patients/RegisterPatient';
import PatientList from '../pages/Patients/PatientList';
import AutoMatching from '../pages/Matching/AutoMatching';
import ManualMatching from '../pages/Matching/ManualMatching';
import Reports from '../pages/Reports';
import Profile from '../pages/Profile';
import Logout from '../pages/Logout';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'users/add', element: <AddUser /> },
          { path: 'users', element: <ViewUsers /> },
          { path: 'users/:id/edit', element: <EditUser /> },
          { path: 'users/:id/delete', element: <DeleteUser /> },
          { path: 'donors/register', element: <RegisterDonor /> },
          { path: 'donors', element: <DonorList /> },
          { path: 'patients/register', element: <RegisterPatient /> },
          { path: 'patients', element: <PatientList /> },
          { path: 'matching/auto', element: <AutoMatching /> },
          { path: 'matching/manual', element: <ManualMatching /> },
          { path: 'reports', element: <Reports /> },
          { path: 'profile', element: <Profile /> },
          { path: 'logout', element: <Logout /> },
        ],
      }
    ]
  }
]);

export default router;
