// Centralized API endpoints. Adjust these to match your Flask routes.
export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout'
  },
  users: {
    root: '/users',
    byId: (id) => `/users/${id}`,
  },
  donors: {
    root: '/donors',
    byId: (id) => `/donors/${id}`,
  },
  patients: {
    root: '/patients',
    byId: (id) => `/patients/${id}`,
  },
  matching: {
    auto: '/matching/auto',
    manual: '/matching/manual',
  },
}

export default endpoints;
