import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiUserPlus, FiHeart, FiUser, FiSearch, FiActivity, FiBarChart2, FiLogOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useState } from 'react';

const linkClass = ({ isActive }) => `list-group-item list-group-item-action border-0 rounded-2 my-1 ${isActive ? 'active custom-active' : ''}`;

export default function Sidebar({ isOpen, onClose }){
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed(c => !c);
  return (
    <aside
      className={`sidebar p-3 position-fixed position-lg-static top-0 start-0 h-100 overflow-auto ${isOpen ? '' : 'd-none d-lg-block'} ${collapsed ? 'collapsed' : ''}`}
      style={{width: collapsed ? '72px':'var(--sidebar-width)', zIndex:1031, transition:'width .25s'}}
    >
      <div className="d-flex align-items-center mb-3">
        <div className="rounded-circle me-2 flex-shrink-0" style={{width:10,height:10,background:'var(--brand-green)'}} />
        {!collapsed && <strong className="text-truncate">Transplant-Link</strong>}
        <button className="btn btn-link btn-sm ms-auto d-none d-lg-inline-flex" type="button" onClick={toggleCollapse} title={collapsed? 'Expand sidebar':'Collapse sidebar'}>
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
        <button className="btn btn-sm ms-2 d-lg-none" onClick={onClose}>✕</button>
      </div>
      <nav className="list-group">
        <NavLink to="/" className={linkClass}><FiHome className="me-2"/>{!collapsed && 'Dashboard'}</NavLink>
        {!collapsed && <div className="mt-3 small text-uppercase text-muted">Users</div>}
        <NavLink to="/users" className={linkClass}><FiUsers className="me-2"/>{!collapsed && 'View Users'}</NavLink>
        <NavLink to="/users/add" className={linkClass}><FiUserPlus className="me-2"/>{!collapsed && 'Add User'}</NavLink>
        {!collapsed && <div className="mt-3 small text-uppercase text-muted">Donors</div>}
        <NavLink to="/donors" className={linkClass}><FiHeart className="me-2"/>{!collapsed && 'Donor List'}</NavLink>
        <NavLink to="/donors/register" className={linkClass}><FiUser className="me-2"/>{!collapsed && 'Register Donor'}</NavLink>
        {!collapsed && <div className="mt-3 small text-uppercase text-muted">Patients</div>}
        <NavLink to="/patients" className={linkClass}><FiSearch className="me-2"/>{!collapsed && 'Patient List'}</NavLink>
        <NavLink to="/patients/register" className={linkClass}><FiUser className="me-2"/>{!collapsed && 'Register Patient'}</NavLink>
        {!collapsed && <div className="mt-3 small text-uppercase text-muted">Matching</div>}
        <NavLink to="/matching/manual" className={linkClass}><FiActivity className="me-2"/>{!collapsed && 'Manual Matching'}</NavLink>
        {!collapsed && <div className="mt-3 small text-uppercase text-muted">More</div>}
        <NavLink to="/reports" className={linkClass}><FiBarChart2 className="me-2"/>{!collapsed && 'Reports'}</NavLink>
        <NavLink to="/logout" className={linkClass}><FiLogOut className="me-2"/>{!collapsed && 'Logout'}</NavLink>
      </nav>
    </aside>
  );
}
