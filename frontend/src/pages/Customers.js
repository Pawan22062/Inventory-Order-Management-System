import { useCallback, useEffect, useState } from 'react';
import Alert from '../components/Alert';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import { api } from '../services/api';

const emptyForm = {
  full_name: '',
  email: '',
  phone_number: '',
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.createCustomer({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
      });
      setSuccess('Customer created successfully');
      closeModal();
      await loadCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    setError('');
    setSuccess('');
    try {
      await api.deleteCustomer(id);
      setSuccess('Customer deleted');
      await loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="page-subtitle">Manage customer records</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Add Customer
        </button>
      </header>

      <Alert type="error" message={error} onDismiss={() => setError('')} />
      <Alert type="success" message={success} onDismiss={() => setSuccess('')} />

      {loading ? (
        <Loading />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    No customers yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone_number}</td>
                    <td className="actions-cell">
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title="New Customer" onClose={closeModal}>
          <form onSubmit={handleSubmit} className="form">
            <label>
              Full Name
              <input name="full_name" value={form.full_name} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Phone Number
              <input name="phone_number" value={form.phone_number} onChange={handleChange} required />
            </label>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Customers;
