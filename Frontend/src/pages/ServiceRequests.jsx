import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Edit3,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  FileText,
  X,
  Loader2,
  ChevronRight,
  ShieldAlert,
  Inbox
} from 'lucide-react';
import { requestService } from '../services/api';

const CATEGORIES = [
  'IT Support',
  'Hardware',
  'Software',
  'Maintenance',
  'Billing',
  'General Inquiry',
  'Customer Support',
  'Security'
];

const CATEGORY_COLORS = {
  'IT Support': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'Hardware': { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
  'Software': { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  'Maintenance': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  'Billing': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  'General Inquiry': { bg: '#f8fafc', text: '#475569', border: '#cbd5e1' },
  'Customer Support': { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' },
  'Security': { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5' },
};

export default function ServiceRequests({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Active item & form state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'IT Support',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load user's requests on mount
  useEffect(() => {
    loadRequests();
  }, []);

  const showToast = (message) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast('');
    }, 4000);
  };

  const loadRequests = async () => {
    setLoading(true);
    setApiError('');
    try {
      const data = await requestService.getAll();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError('Failed to load service requests. Please make sure you are logged in.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 150) {
      errs.title = 'Title cannot exceed 150 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required';
    } else if (formData.description.trim().length < 5) {
      errs.description = 'Description must be at least 5 characters';
    }

    if (!formData.category) {
      errs.category = 'Please select a category';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle Create Request
  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      category: 'IT Support',
    });
    setFormErrors({});
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setApiError('');
    try {
      const newReq = await requestService.create({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
      });

      setRequests((prev) => [newReq, ...prev]);
      setCreateModalOpen(false);
      showToast(`Service Request #${newReq.id} created successfully!`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to create service request.';
      setApiError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Request
  const handleOpenEditModal = (req) => {
    setSelectedRequest(req);
    setFormData({
      title: req.title,
      description: req.description,
      category: req.category,
    });
    setFormErrors({});
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !selectedRequest) return;

    setSubmitting(true);
    setApiError('');
    try {
      const updated = await requestService.update(selectedRequest.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
      });

      setRequests((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditModalOpen(false);
      if (viewModalOpen && selectedRequest?.id === updated.id) {
        setSelectedRequest(updated);
      }
      showToast(`Service Request #${updated.id} updated successfully!`);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to update service request.';
      setApiError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Request
  const handleOpenDeleteModal = (req) => {
    setSelectedRequest(req);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    setApiError('');
    try {
      await requestService.delete(selectedRequest.id);
      setRequests((prev) => prev.filter((item) => item.id !== selectedRequest.id));
      setDeleteModalOpen(false);
      if (viewModalOpen) setViewModalOpen(false);
      showToast(`Service Request #${selectedRequest.id} has been deleted.`);
      setSelectedRequest(null);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to delete service request.';
      setApiError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle View Modal
  const handleOpenViewModal = (req) => {
    setSelectedRequest(req);
    setViewModalOpen(true);
  };

  // Format Dates
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered & Sorted Requests
  const filteredRequests = useMemo(() => {
    return requests
      .filter((item) => {
        const matchesCat =
          categoryFilter === 'ALL' || item.category === categoryFilter;
        const matchesQuery =
          searchQuery.trim() === '' ||
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(item.id).includes(searchQuery);
        return matchesCat && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.dateCreated) - new Date(a.dateCreated);
        }
        if (sortBy === 'oldest') {
          return new Date(a.dateCreated) - new Date(b.dateCreated);
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [requests, categoryFilter, searchQuery, sortBy]);

  // Distinct category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    requests.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return counts;
  }, [requests]);

  return (
    <div className="requests-container">
      {/* Toast Alert */}
      {successToast && (
        <div className="toast-notification">
          <CheckCircle2 size={20} color="#10b981" />
          <span>{successToast}</span>
          <button className="modal-close-icon" onClick={() => setSuccessToast('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="requests-hero">
        <div className="hero-left">
          <div className="hero-badge-auth">
            <span className="dot-pulse"></span>
            <span>JWT Authenticated Session</span>
          </div>
          <h1>My Service Requests</h1>
          <p>
            Create, track, and manage your personalized service tickets securely with Spring Security.
          </p>
        </div>
        <div className="hero-right">
          <button className="btn-create-request" onClick={handleOpenCreateModal}>
            <PlusCircle size={20} />
            <span>New Service Request</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="requests-stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <FileText size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Requests</span>
            <span className="stat-value">{requests.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <Layers size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Categories Used</span>
            <span className="stat-value">{Object.keys(categoryCounts).length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-green">
            <User size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Account Owner</span>
            <span className="stat-value truncate-text" title={currentUser?.email}>
              {currentUser?.name || currentUser?.email || 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {apiError && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={20} />
          <span>{apiError}</span>
          <button
            className="modal-close-icon"
            style={{ marginLeft: 'auto' }}
            onClick={() => setApiError('')}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="requests-toolbar">
        <div className="toolbar-search">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search your requests by title, description, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="toolbar-search-input"
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="toolbar-controls">
          {/* Category Filter */}
          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="toolbar-select"
            >
              <option value="ALL">All Categories ({requests.length})</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} {categoryCounts[cat] ? `(${categoryCounts[cat]})` : '(0)'}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <Clock size={16} className="filter-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="toolbar-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            className="btn-icon-refresh"
            onClick={loadRequests}
            disabled={loading}
            title="Refresh requests from database"
          >
            <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          </button>
        </div>
      </div>

      {/* Requests Cards List */}
      {loading ? (
        <div className="loading-state">
          <Loader2 size={36} className="spinner" color="var(--primary)" />
          <p>Loading your authenticated service requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <Inbox size={48} />
          </div>
          {searchQuery || categoryFilter !== 'ALL' ? (
            <>
              <h3>No matching service requests found</h3>
              <p>Try adjusting your search criteria or clear your category filter.</p>
              <button
                className="nav-btn nav-btn-ghost"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                }}
              >
                Reset Filters
              </button>
            </>
          ) : (
            <>
              <h3>You have not submitted any service requests yet</h3>
              <p>
                Service requests you create are securely isolated and accessible only to your account.
              </p>
              <button className="btn-create-request" onClick={handleOpenCreateModal}>
                <PlusCircle size={18} />
                <span>Create Your First Request</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map((req) => {
            const catStyle = CATEGORY_COLORS[req.category] || {
              bg: '#f1f5f9',
              text: '#475569',
              border: '#e2e8f0',
            };

            return (
              <div key={req.id} className="request-card">
                <div className="request-card-header">
                  <div className="request-id-badge">
                    <span>#SR-{req.id}</span>
                  </div>
                  <span
                    className="category-pill"
                    style={{
                      backgroundColor: catStyle.bg,
                      color: catStyle.text,
                      borderColor: catStyle.border,
                    }}
                  >
                    <Tag size={12} />
                    {req.category}
                  </span>
                </div>

                <h3 className="request-title" onClick={() => handleOpenViewModal(req)}>
                  {req.title}
                </h3>

                <p className="request-description">{req.description}</p>

                <div className="request-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>{formatDateTime(req.dateCreated)}</span>
                  </div>
                  <div className="meta-item" title={`Created by ${req.createdBy}`}>
                    <User size={14} />
                    <span className="truncate-text">{req.createdBy}</span>
                  </div>
                </div>

                <div className="request-card-footer">
                  <button
                    className="action-btn action-view"
                    onClick={() => handleOpenViewModal(req)}
                    title="View full details"
                  >
                    <Eye size={15} />
                    <span>View</span>
                  </button>
                  <button
                    className="action-btn action-edit"
                    onClick={() => handleOpenEditModal(req)}
                    title="Edit request"
                  >
                    <Edit3 size={15} />
                    <span>Edit</span>
                  </button>
                  <button
                    className="action-btn action-delete"
                    onClick={() => handleOpenDeleteModal(req)}
                    title="Delete request"
                  >
                    <Trash2 size={15} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => !submitting && setCreateModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge modal-icon-create">
                  <PlusCircle size={22} />
                </div>
                <div>
                  <h2>Create Service Request</h2>
                  <p>Submit a new service ticket for your account</p>
                </div>
              </div>
              <button
                className="modal-close-icon"
                onClick={() => !submitting && setCreateModalOpen(false)}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} noValidate>
              <div className="modal-body">
                {/* Title */}
                <div className="form-group">
                  <label className="form-label" htmlFor="create-title">
                    Request Title <span className="req-star">*</span>
                  </label>
                  <input
                    id="create-title"
                    type="text"
                    placeholder="e.g., Replace office monitor cable"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                    }}
                    className={`form-input-modal ${formErrors.title ? 'input-error' : ''}`}
                    disabled={submitting}
                  />
                  {formErrors.title && <div className="field-error">{formErrors.title}</div>}
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label" htmlFor="create-category">
                    Category <span className="req-star">*</span>
                  </label>
                  <select
                    id="create-category"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                    }}
                    className={`form-select-modal ${formErrors.category ? 'input-error' : ''}`}
                    disabled={submitting}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <div className="field-error">{formErrors.category}</div>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label" htmlFor="create-description">
                    Detailed Description <span className="req-star">*</span>
                  </label>
                  <textarea
                    id="create-description"
                    rows={4}
                    placeholder="Provide detailed description of the service required..."
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (formErrors.description)
                        setFormErrors({ ...formErrors, description: '' });
                    }}
                    className={`form-textarea-modal ${
                      formErrors.description ? 'input-error' : ''
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.description && (
                    <div className="field-error">{formErrors.description}</div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn modal-btn-cancel"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spinner" /> Creating...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div className="modal-backdrop" onClick={() => !submitting && setEditModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge modal-icon-edit">
                  <Edit3 size={22} />
                </div>
                <div>
                  <h2>Edit Service Request #{selectedRequest?.id}</h2>
                  <p>Update request details and information</p>
                </div>
              </div>
              <button
                className="modal-close-icon"
                onClick={() => !submitting && setEditModalOpen(false)}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} noValidate>
              <div className="modal-body">
                {/* Title */}
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-title">
                    Request Title <span className="req-star">*</span>
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                    }}
                    className={`form-input-modal ${formErrors.title ? 'input-error' : ''}`}
                    disabled={submitting}
                  />
                  {formErrors.title && <div className="field-error">{formErrors.title}</div>}
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-category">
                    Category <span className="req-star">*</span>
                  </label>
                  <select
                    id="edit-category"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      if (formErrors.category) setFormErrors({ ...formErrors, category: '' });
                    }}
                    className={`form-select-modal ${formErrors.category ? 'input-error' : ''}`}
                    disabled={submitting}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <div className="field-error">{formErrors.category}</div>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-description">
                    Detailed Description <span className="req-star">*</span>
                  </label>
                  <textarea
                    id="edit-description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      if (formErrors.description)
                        setFormErrors({ ...formErrors, description: '' });
                    }}
                    className={`form-textarea-modal ${
                      formErrors.description ? 'input-error' : ''
                    }`}
                    disabled={submitting}
                  />
                  {formErrors.description && (
                    <div className="field-error">{formErrors.description}</div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-btn modal-btn-cancel"
                  onClick={() => setEditModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="spinner" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="modal-backdrop" onClick={() => !submitting && setDeleteModalOpen(false)}>
          <div className="modal-dialog modal-dialog-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge modal-icon-delete">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h2>Delete Service Request</h2>
                  <p>Confirmation required</p>
                </div>
              </div>
              <button
                className="modal-close-icon"
                onClick={() => !submitting && setDeleteModalOpen(false)}
                disabled={submitting}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                Are you sure you want to delete Service Request{' '}
                <strong>#{selectedRequest?.id}</strong>: "
                <em>{selectedRequest?.title}</em>"?
              </p>
              <div className="delete-warning-box">
                <ShieldAlert size={18} color="#dc2626" />
                <span>
                  This action is permanent and cannot be undone. This request will be permanently removed from the database.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setDeleteModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-danger"
                onClick={handleDeleteConfirm}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spinner" /> Deleting...
                  </>
                ) : (
                  'Yes, Delete Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedRequest && (
        <div className="modal-backdrop" onClick={() => setViewModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge modal-icon-view">
                  <FileText size={22} />
                </div>
                <div>
                  <h2>Service Request Details</h2>
                  <p>Request #SR-{selectedRequest.id}</p>
                </div>
              </div>
              <button className="modal-close-icon" onClick={() => setViewModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="view-header-badge-row">
                <span
                  className="category-pill"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[selectedRequest.category]?.bg || '#f1f5f9',
                    color:
                      CATEGORY_COLORS[selectedRequest.category]?.text || '#475569',
                    borderColor:
                      CATEGORY_COLORS[selectedRequest.category]?.border || '#cbd5e1',
                  }}
                >
                  <Tag size={13} />
                  {selectedRequest.category}
                </span>
                <span className="badge badge-active">Active Ticket</span>
              </div>

              <h2 className="view-title">{selectedRequest.title}</h2>

              <div className="view-section">
                <h4 className="view-section-label">Description</h4>
                <div className="view-description-box">
                  {selectedRequest.description}
                </div>
              </div>

              <div className="view-grid">
                <div className="view-info-item">
                  <span className="view-label">Request ID</span>
                  <span className="view-value">#{selectedRequest.id}</span>
                </div>
                <div className="view-info-item">
                  <span className="view-label">Category</span>
                  <span className="view-value">{selectedRequest.category}</span>
                </div>
                <div className="view-info-item">
                  <span className="view-label">Date Created</span>
                  <span className="view-value">{formatDateTime(selectedRequest.dateCreated)}</span>
                </div>
                <div className="view-info-item">
                  <span className="view-label">Created By</span>
                  <span className="view-value">{selectedRequest.createdBy}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="action-btn action-edit"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
                onClick={() => {
                  setViewModalOpen(false);
                  handleOpenEditModal(selectedRequest);
                }}
              >
                <Edit3 size={16} /> Edit Request
              </button>
              <button
                type="button"
                className="action-btn action-delete"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
                onClick={() => {
                  handleOpenDeleteModal(selectedRequest);
                }}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
